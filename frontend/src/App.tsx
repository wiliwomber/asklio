import { Container, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import PdfUploadForm from "./components/PdfUploadForm";

function App() {
  return (
    <Container maxW="6xl" py={12}>
      <VStack align="flex-start" spacing={6} mb={6}>
        <Text textTransform="uppercase" letterSpacing="0.16em" fontSize="xs" color="gray.500">
          AskLio
        </Text>
        <Flex direction="column" gap={2}>
          <Heading as="h1" size="xl">
            Upload a procurement PDF
          </Heading>
          <Text color="gray.600" maxW="3xl">
            Select a PDF document and send it to the backend. Only valid PDF files are accepted. View all stored PDFs
            in the dashboard.
          </Text>
        </Flex>
      </VStack>

      <Tabs variant="enclosed" colorScheme="blue" isFitted>
        <TabList>
          <Tab>Upload PDF</Tab>
          <Tab>Dashboard</Tab>
        </TabList>
        <TabPanels mt={4}>
          <TabPanel px={0}>
            <PdfUploadForm />
          </TabPanel>
          <TabPanel px={0}>
            <Dashboard />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default App;
