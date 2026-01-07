import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { uploadPdf } from "../api/upload";
import { type UploadResponse } from "../types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function isPdf(file: File): boolean {
  const hasPdfMimeType = file.type === "application/pdf";
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");

  return hasPdfMimeType && hasPdfExtension;
}

export default function PdfUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const fileLabel = useMemo(() => {
    if (!selectedFile) {
      return "No file chosen";
    }

    const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return `${selectedFile.name} (${sizeInMb} MB)`;
  }, [selectedFile]);

  const resetStatus = (): void => {
    setResult(null);
    setError(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    resetStatus();

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isPdf(file)) {
      setSelectedFile(null);
      setError("Please choose a valid PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setError("PDF must be 10MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Select a PDF before uploading.");
      return;
    }

    setIsUploading(true);
    setResult(null);
    setError(null);

    try {
      const response = await uploadPdf(selectedFile);
      setResult(response);
      toast({
        status: "success",
        title: "Uploaded",
        description: "PDF stored successfully",
        duration: 3000,
        isClosable: true,
      });
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload PDF";
      setError(errorMessage);
      toast({
        status: "error",
        title: "Upload failed",
        description: errorMessage,
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel htmlFor="pdfInput">Upload PDF</FormLabel>
            <Input
              id="pdfInput"
              name="pdf"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              isDisabled={isUploading}
              variant="filled"
              py={2}
            />
            <FormHelperText>Only PDF files up to 10MB are accepted.</FormHelperText>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {fileLabel}
            </Text>
          </FormControl>

          <Flex gap={3} wrap="wrap">
            <Button type="submit" colorScheme="blue" isDisabled={!selectedFile || isUploading} isLoading={isUploading}>
              Send to backend
            </Button>
            <Button variant="outline" onClick={() => setSelectedFile(null)} isDisabled={isUploading}>
              Clear selection
            </Button>
          </Flex>

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50" borderColor="blue.200">
              <Text fontWeight="bold" color="blue.700">
                {result.message}
              </Text>
              <Text color="gray.700">File name: {result.uploadMeta.fileName}</Text>
              <Text color="gray.700">File size: {(result.uploadMeta.fileSize / (1024 * 1024)).toFixed(2)} MB</Text>
              <Text color="gray.700">Status: {result.procurementRequest.status}</Text>
              <Text color="gray.700">
                Vendor: {result.procurementRequest.extraction.vendor ?? "n/a"} | Total:{" "}
                {result.procurementRequest.extraction.totalCost ?? "n/a"}
              </Text>
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
