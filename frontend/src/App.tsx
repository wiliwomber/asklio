import { Badge, Box, Container, Flex, Heading, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { fetchUploads, updateProcurementRequest } from "./api/upload";
import UserWizard from "./components/UserWizard";
import { RequestTables } from "./components/RequestTables";
import { type ProcurementRequest } from "./types";
import { isRequestComplete } from "./utils/requestValidation";

function App() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadRequests = async () => {
    const data = await fetchUploads();
    setRequests(data);
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const other = useMemo(() => requests.filter((r) => r.status !== "pending"), [requests]);

  const handleEdit = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    onOpen();
  };

  const handleUploadNew = () => {
    setSelectedRequest(null);
    onOpen();
  };

  const handleSubmitDirect = async (request: ProcurementRequest) => {
    if (!isRequestComplete(request)) return;
    await updateProcurementRequest(request.id, { ...request, status: "open" });
    await loadRequests();
  };

  const handleWizardClose = (refresh?: boolean) => {
    onClose();
    setSelectedRequest(null);
    if (refresh) void loadRequests();
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, #0f172a 0%, #111827 35%, #0b1224 70%)"
      color="gray.100"
      py={10}
      px={4}
    >
      <Container maxW="8xl">
        <Flex justify="space-between" align="flex-start" mb={8}>
          <VStack align="flex-start" spacing={2}>
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1}>
              AskLio
            </Badge>
            <Heading as="h1" size="xl" color="white">
              Procurement workspace
            </Heading>
            <Text color="gray.300" maxW="3xl">
              Upload PDFs, review extractions, and manage pending or submitted requests.
            </Text>
          </VStack>
        </Flex>

        {!isOpen && (
          <RequestTables pending={pending} other={other} onUploadNew={handleUploadNew} onEdit={handleEdit} onSubmit={handleSubmitDirect} />
        )}

        {isOpen && (
          <Box mt={8}>
            <UserWizard
              initialRequest={selectedRequest}
              onClose={() => handleWizardClose(true)}
              onCloseWithoutRefresh={() => handleWizardClose(false)}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
