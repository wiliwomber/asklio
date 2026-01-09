import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { uploadPdf, updateProcurementRequest } from "../api/upload";
import { COMMODITY_OPTIONS } from "../data/commodities";
import { type OrderLine, type ProcurementRequest, type UploadResponse } from "../types";
import { buildPdfUrl } from "../api/upload";
import { isRequestComplete, isOrderLinesComplete } from "../utils/requestValidation";

type WizardView = "upload" | "uploading" | "review";

type Props = {
  initialRequest?: ProcurementRequest | null;
  onClose?: () => void;
  onCloseWithoutRefresh?: () => void;
};

export default function UserWizard({ initialRequest = null, onClose, onCloseWithoutRefresh }: Props) {
  const [view, setView] = useState<WizardView>(initialRequest ? "review" : "upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<ProcurementRequest | null>(initialRequest ? { ...initialRequest } : null);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialRequest ? buildPdfUrl(initialRequest.id) : null);
  const panelBg = useColorModeValue("rgba(255,255,255,0.06)", "whiteAlpha.100");
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRequest) {
      setRequest({ ...initialRequest, orderLines: initialRequest.orderLines ?? [] });
      setPdfUrl(buildPdfUrl(initialRequest.id));
      setView("review");
    }
  }, [initialRequest]);

  const categories = useMemo(() => Array.from(new Set(COMMODITY_OPTIONS.map((o) => o.category))), []);

  const filteredGroups = useMemo(() => {
    if (!request?.category) return COMMODITY_OPTIONS;
    return COMMODITY_OPTIONS.filter((o) => o.category === request.category);
  }, [request?.category]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  };

  const startUpload = async () => {
    if (!selectedFile) return;
    setError(null);
    setView("uploading");
    try {
      const response: UploadResponse = await uploadPdf(selectedFile);
      setRequest({
        ...response.procurementRequest,
        orderLines: response.procurementRequest.orderLines ?? [],
        status: "pending",
      });
      setPdfUrl(buildPdfUrl(response.procurementRequest.id));
      setView("review");
      if (isRequestComplete(response.procurementRequest)) {
        toast({ status: "success", title: "Request parsed", description: "All fields were extracted." });
      } else {
        toast({ status: "warning", title: "Review needed", description: "Some fields need attention." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setView("upload");
    }
  };

  const handleFieldChange =
    (field: keyof ProcurementRequest) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!request) return;
      setRequest({ ...request, [field]: event.target.value });
    };

  const handleOrderLineChange = (index: number, field: keyof OrderLine, value: string) => {
    if (!request) return;
    const nextLines = [...(request.orderLines ?? [])];
    const line = nextLines[index] ?? {};
    nextLines[index] = {
      ...line,
      [field]: field === "product" ? value : value === "" ? null : Number(value),
    };
    setRequest({ ...request, orderLines: nextLines });
  };

  const addOrderLine = () => {
    if (!request) return;
    setRequest({ ...request, orderLines: [...(request.orderLines ?? []), {}] });
  };

  const isFormValid = useMemo(() => isRequestComplete(request), [request]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!request) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateProcurementRequest(request.id, { ...request, status: "open" });
      toast({ status: "success", title: "Request submitted" });
      onClose?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save request";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClose = async () => {
    if (!request) {
      onCloseWithoutRefresh?.();
      return;
    }
    try {
      await updateProcurementRequest(request.id, { ...request });
    } finally {
      onCloseWithoutRefresh?.();
    }
  };

  const iframeSrc = pdfUrl ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH` : null;

  return (
    <Card
      bgGradient="linear(to-br, rgba(255,255,255,0.05), rgba(255,255,255,0.02))"
      border="1px solid"
      borderColor="whiteAlpha.200"
      shadow="2xl"
      backdropFilter="blur(8px)"
    >
      <CardBody>
        <Stack spacing={6} align="center">
          <Box w="100%" maxW="1200px">
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="black">
                  Procurement request wizard
                </Text>
                <Text color="gray.600">
                  {view === "upload" && "Upload a PDF for automated processing."}
                  {view === "uploading" && "Processing your PDF..."}
                  {view === "review" && "Review and edit extracted fields."}
                </Text>
              </VStack>
              <HStack>
                <Button variant="outline" colorScheme="purple" size="sm" onClick={onCloseWithoutRefresh}>
                  Cancel
                </Button>
              </HStack>
            </HStack>
          </Box>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {view === "upload" && (
            <Stack spacing={4} w="100%" maxW="600px" minH={"400px"} align={"center"}>
              {selectedFile && <Text color="gray.200">{selectedFile.name}</Text>}
              {!selectedFile && <Text color="gray.200"><Text color="gray.600">No file selected.</Text></Text>}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <HStack spacing={3} align="flex-start">
                <Button variant={"outline"} colorScheme="purple" onClick={() => fileInputRef.current?.click()}>
                  Upload new document
                </Button>
                <Button colorScheme="purple" onClick={startUpload} isDisabled={!selectedFile}>
                  Upload
                </Button>
              </HStack>
            </Stack>
          )}

          {view === "uploading" && (
            <VStack py={10} spacing={3}>
              <Spinner size="xl" color="purple.300" />
              <Text fontSize="lg" fontWeight="bold" color="gray.50">
                Uploading…
              </Text>
              <Text color="gray.400">Please wait while we process your PDF.</Text>
            </VStack>
          )}

          {view === "review" && request && (
            <SimpleGrid
              columns={[1, 2]}
              spacing={6}
              alignItems="stretch"
              templateColumns={{ base: "1fr", lg: "1fr 2fr" }}
              w="100%"
              maxW="1200px"
            >
              <Box as="form" onSubmit={handleSubmit} bg={panelBg} p={6} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.200">
                <Stack spacing={4}>
                  <SimpleGrid columns={[1, 2]} spacing={4}>
                    <FormControl isRequired isInvalid={!request.requestor}>
                      <FormLabel>Requestor</FormLabel>
                      <Input value={request.requestor ?? ""} onChange={handleFieldChange("requestor")} />
                    </FormControl>
                    <FormControl isRequired isInvalid={!request.requestorDepartment}>
                      <FormLabel>Department</FormLabel>
                      <Input value={request.requestorDepartment ?? ""} onChange={handleFieldChange("requestorDepartment")} />
                    </FormControl>
                    <FormControl isRequired isInvalid={!request.vendor}>
                      <FormLabel>Vendor</FormLabel>
                      <Input value={request.vendor ?? ""} onChange={handleFieldChange("vendor")} />
                    </FormControl>
                    <FormControl isRequired isInvalid={!request.vatId}>
                      <FormLabel>VAT ID</FormLabel>
                      <Input value={request.vatId ?? ""} onChange={handleFieldChange("vatId")} />
                    </FormControl>
                    <FormControl isRequired isInvalid={!request.category}>
                      <FormLabel>Category</FormLabel>
                      <Select
                        placeholder="Select category"
                        value={request.category ?? ""}
                        onChange={(e) => setRequest({ ...request, category: e.target.value || null, commodityGroup: null })}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl isRequired isInvalid={!request.commodityGroup}>
                      <FormLabel>Commodity group</FormLabel>
                      <Select
                        placeholder="Select commodity group"
                        value={request.commodityGroup ?? ""}
                        onChange={(e) => {
                          const group = e.target.value || null;
                          const matched = COMMODITY_OPTIONS.find((o) => o.commodityGroup === group);
                          setRequest({ ...request, commodityGroup: group, category: matched?.category ?? request.category ?? null });
                        }}
                      >
                        {filteredGroups.map((opt) => (
                          <option key={opt.commodityGroup} value={opt.commodityGroup}>
                            {opt.commodityGroup}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl isRequired isInvalid={request.totalCost === null || request.totalCost === undefined}>
                      <FormLabel>Total cost</FormLabel>
                      <NumberInput value={request.totalCost ?? undefined} precision={2} min={0}>
                        <NumberInputField
                          onChange={(e) => setRequest({ ...request, totalCost: e.target.value === "" ? null : Number(e.target.value) })}
                        />
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired isInvalid={!request.description}>
                    <FormLabel>Description</FormLabel>
                    <Textarea value={request.description ?? ""} onChange={handleFieldChange("description")} />
                  </FormControl>

                  <HStack spacing={3}>
                    <Text fontWeight="semibold">
                      Order lines
                    </Text>
                    <Spacer></Spacer>
                    <Button size="sm" onClick={addOrderLine} variant={"outline"} >
                      Add order line
                    </Button>
                  </HStack>

                  <Stack spacing={3}>
                    {(request.orderLines ?? []).map((line, index) => (
                      <SimpleGrid key={index} columns={[1, 2, 4]} spacing={3}>
                        <Input
                          title="Product"
                          placeholder="Product"
                          value={line.product ?? ""}
                          onChange={(e) => handleOrderLineChange(index, "product", e.target.value)}
                          isInvalid={!line.product}
                        />
                        <NumberInput value={line.unitPrice ?? undefined} precision={2} min={0}>
                          <NumberInputField
                            placeholder="Unit price"
                            onChange={(e) => handleOrderLineChange(index, "unitPrice", e.target.value)}
                          />
                        </NumberInput>
                        <NumberInput value={line.quantity ?? undefined} precision={0} min={0}>
                          <NumberInputField
                            placeholder="Qty"
                            onChange={(e) => handleOrderLineChange(index, "quantity", e.target.value)}
                          />
                        </NumberInput>
                        <NumberInput value={line.totalCost ?? undefined} precision={2} min={0}>
                          <NumberInputField
                            placeholder="Total"
                            onChange={(e) => handleOrderLineChange(index, "totalCost", e.target.value)}
                          />
                        </NumberInput>
                      </SimpleGrid>
                    ))}

                  </Stack>

                  <HStack spacing={3} pt={2}>
                    <Button type="submit" colorScheme="purple" isLoading={isSaving} isDisabled={!isFormValid}>
                      Submit request
                    </Button>
                    <Button variant="outline" onClick={handleSaveClose} isDisabled={isSaving}>
                      Save and close
                    </Button>
                  </HStack>
                </Stack>
              </Box>

              <Box borderWidth="1px" borderRadius="lg" overflow="hidden" minH="70vh" bg="blackAlpha.700">
                {iframeSrc ? (
                  <iframe title="Uploaded PDF" src={iframeSrc} style={{ width: "100%", height: "80vh", border: "none" }} />
                ) : (
                  <VStack h="100%" justify="center" p={6}>
                    <Text color="gray.500">PDF preview will appear here after upload.</Text>
                  </VStack>
                )}
              </Box>
            </SimpleGrid>
          )}

          {view === "review" && request && !isOrderLinesComplete(request) && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription>Some order lines are incomplete. Please fill in all required fields.</AlertDescription>
            </Alert>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
