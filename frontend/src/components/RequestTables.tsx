import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { buildPdfUrl } from "../api/upload";
import { type ProcurementRequest } from "../types";
import { isRequestComplete } from "../utils/requestValidation";

type Props = {
  pending: ProcurementRequest[];
  other: ProcurementRequest[];
  onUploadNew: () => void;
  onEdit: (request: ProcurementRequest) => void;
  onSubmit: (request: ProcurementRequest) => void;
  onDelete: (request: ProcurementRequest) => void;
};

function statusColor(status: string) {
  switch (status) {
    case "pending":
      return "yellow";
    case "open":
      return "blue";
    case "inprogress":
      return "purple";
    case "closed":
      return "green";
    default:
      return "gray";
  }
}

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleString();
}

export function RequestTables({ pending, other, onUploadNew, onEdit, onSubmit, onDelete }: Props) {
  return (
    <Stack spacing={6}>
      <HStack justify="space-between">
        <VStack align="flex-start" spacing={1}>
          <Text fontSize="lg" fontWeight="bold" color="white">
            Requests
          </Text>
          <Text color="gray.400">Review and submit procurement requests.</Text>
        </VStack>
        <Button colorScheme="purple" onClick={onUploadNew}>
          Upload new Request
        </Button>
      </HStack>

      <Card bg="rgba(255,255,255,0.04)" border="1px solid" borderColor="whiteAlpha.200" shadow="xl">
        <CardBody>
          <Text fontWeight="semibold" mb={3} color="white">
            Requests pending submission
          </Text>
          {pending.length === 0 ? (
            <Text color="white">No pending requests.</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="whiteAlpha" size="sm" textColor={"white"}>
                <Thead>
                  <Tr>
                    <Th color="gray.300">Requestor</Th>
                    <Th color="gray.300">Vendor</Th>
                    <Th color="gray.300">Commodity</Th>
                    <Th color="gray.300">Category</Th>
                    <Th color="gray.300">Status</Th>
                    <Th color="gray.300">Created</Th>
                    <Th color="gray.300">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pending.map((req) => {
                    const complete = isRequestComplete(req);
                    return (
                      <Tr key={req.id}>
                        <Td>{req.requestor ?? "—"}</Td>
                        <Td>{req.vendor ?? "—"}</Td>
                        <Td>{req.commodityGroup ?? "—"}</Td>
                        <Td>{req.category ?? "—"}</Td>
                        <Td>
                          <Badge colorScheme={statusColor(req.status)} textTransform="capitalize">
                            {req.status}
                          </Badge>
                        </Td>
                        <Td>{formatDate(req.createdAt)}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button size="xs" colorScheme="red" variant="outline" onClick={() => onDelete(req)}>
                              Delete
                            </Button>
                            <Button as="a" href={buildPdfUrl(req.id)} target="_blank" rel="noreferrer" size="xs" colorScheme="purple" variant="outline" >
                              View
                            </Button>
                            <Button size="xs" onClick={() => onEdit(req)} variant="outline" colorScheme="purple">
                              Edit
                            </Button>
                            <Button size="xs" colorScheme="purple" onClick={() => onSubmit(req)} isDisabled={!complete}>
                              Submit
                            </Button>

                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      <Card bg="rgba(255,255,255,0.04)" border="1px solid" borderColor="whiteAlpha.200" shadow="xl">
        <CardBody>
          <Text fontWeight="semibold" mb={3} color="white">
            Submitted requests
          </Text>
          {other.length === 0 ? (
            <Text color="gray.400">No submitted requests.</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="whiteAlpha" size="sm" textColor={"white"}>
                <Thead>
                  <Tr>
                    <Th color="gray.300">Requestor</Th>
                    <Th color="gray.300">Vendor</Th>
                    <Th color="gray.300">Commodity</Th>
                    <Th color="gray.300">Category</Th>
                    <Th color="gray.300">Status</Th>
                    <Th color="gray.300">Submitted</Th>
                    <Th color="gray.300">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {other.map((req) => (
                    <Tr key={req.id}>
                      <Td>{req.requestor ?? "—"}</Td>
                      <Td>{req.vendor ?? "—"}</Td>
                      <Td>{req.commodityGroup ?? "—"}</Td>
                      <Td>{req.category ?? "—"}</Td>
                      <Td>
                        <Badge colorScheme={statusColor(req.status)} textTransform="capitalize">
                          {req.status}
                        </Badge>
                      </Td>
                      <Td>{formatDate(req.createdAt)}</Td>
                      <Td>
                        <Button as="a" href={buildPdfUrl(req.id)} target="_blank" rel="noreferrer" size="xs"  >
                          View document
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
    </Stack>
  );
}
