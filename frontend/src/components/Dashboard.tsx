import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { buildPdfUrl, fetchUploads } from "../api/upload";
import { type UploadSummary } from "../types";

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleString();
}

export default function Dashboard() {
  const [uploads, setUploads] = useState<UploadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await fetchUploads();
        setUploads(items);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load uploads";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <Card>
      <CardBody>
        <VStack align="flex-start" spacing={3} mb={3}>
          <HStack spacing={3}>
            <Text fontSize="lg" fontWeight="bold">
              Uploaded PDFs
            </Text>
            <Badge colorScheme="blue" borderRadius="md">
              {uploads.length}
            </Badge>
          </HStack>
          <Text color="gray.600">Click “View” to open the stored PDF.</Text>
        </VStack>

        {isLoading && (
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text color="gray.600">Loading uploads…</Text>
          </HStack>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && uploads.length === 0 && <Text color="gray.600">No uploads yet.</Text>}

        {!isLoading && !error && uploads.length > 0 && (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>File name</Th>
                  <Th>Vendor</Th>
                  <Th>Size</Th>
                  <Th>Request status</Th>
                  <Th>Total</Th>
                  <Th>Uploaded</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {uploads.map((upload) => (
                  <Tr key={upload.id}>
                    <Td maxW="320px">
                      <Text noOfLines={1}>{upload.fileName}</Text>
                    </Td>
                    <Td>{upload.procurementRequest?.extraction.vendor ?? "–"}</Td>
                    <Td>{formatSize(upload.fileSize)}</Td>
                    <Td>
                      {upload.procurementRequest ? (
                        <Badge colorScheme="blue" borderRadius="md" textTransform="capitalize">
                          {upload.procurementRequest.status}
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray">Pending</Badge>
                      )}
                    </Td>
                    <Td>{upload.procurementRequest?.extraction.totalCost ?? "–"}</Td>
                    <Td>{formatDate(upload.uploadedAt)}</Td>
                    <Td>
                      <Button as="a" href={buildPdfUrl(upload.id)} target="_blank" rel="noreferrer" size="sm" variant="outline">
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
