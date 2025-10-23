const axios = require("axios");

const API_BASE = "http://localhost:5000/api/v1";

// Test credentials (you'll need an admin user)
const TEST_CREDENTIALS = {
  contact: "admin2@gmail.com", // Admin user with reset password
  password: "test123456", // Reset password
};

let authToken = "";
let createdEventId = "";
let createdQuizId = "";
let createdQuestionId = "";

async function testLogin() {
  try {
    console.log("\n🔐 Testing Login...");
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      TEST_CREDENTIALS
    );
    authToken = response.data.data.token;
    console.log("✅ Login successful");
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error(
      "❌ Login failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function testEventCRUD() {
  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // CREATE
    console.log("\n📝 Testing Event CREATE...");
    const createResponse = await axios.post(
      `${API_BASE}/events`,
      {
        title: "Test Event " + Date.now(),
        description: "This is a test event",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        isActive: true,
      },
      { headers }
    );
    createdEventId = createResponse.data.data._id;
    console.log(`✅ Event created successfully (ID: ${createdEventId})`);

    // UPDATE
    console.log("\n✏️  Testing Event UPDATE...");
    await axios.patch(
      `${API_BASE}/events/${createdEventId}`,
      { description: "Updated description" },
      { headers }
    );
    console.log("✅ Event updated successfully");

    // DELETE (we'll delete later)
    console.log("⏸️  Event DELETE will be tested at the end");

    return true;
  } catch (error) {
    console.error(
      "❌ Event CRUD failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function testQuizCRUD() {
  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // CREATE
    console.log("\n📝 Testing Quiz CREATE...");
    const createResponse = await axios.post(
      `${API_BASE}/quizzes`,
      {
        title: "Test Quiz " + Date.now(),
        description: "This is a test quiz",
        eventId: createdEventId,
        duration: 30,
        totalQuestions: 5,
        instructions: "Test instructions",
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
      },
      { headers }
    );
    createdQuizId = createResponse.data.data._id;
    console.log(`✅ Quiz created successfully (ID: ${createdQuizId})`);

    // UPDATE
    console.log("\n✏️  Testing Quiz UPDATE...");
    await axios.patch(
      `${API_BASE}/quizzes/${createdQuizId}`,
      { duration: 45 },
      { headers }
    );
    console.log("✅ Quiz updated successfully");

    // DELETE (we'll delete later)
    console.log("⏸️  Quiz DELETE will be tested at the end");

    return true;
  } catch (error) {
    console.error(
      "❌ Quiz CRUD failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function testQuestionCRUD() {
  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // CREATE
    console.log("\n📝 Testing Question CREATE...");
    const createResponse = await axios.post(
      `${API_BASE}/questions`,
      {
        quizId: createdQuizId,
        text: "What is 2 + 2?",
        questionType: "MCQ",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        marks: 1,
        difficulty: "easy",
      },
      { headers }
    );
    createdQuestionId = createResponse.data.data._id;
    console.log(`✅ Question created successfully (ID: ${createdQuestionId})`);

    // UPDATE
    console.log("\n✏️  Testing Question UPDATE...");
    await axios.put(
      `${API_BASE}/questions/${createdQuestionId}`,
      { marks: 2 },
      { headers }
    );
    console.log("✅ Question updated successfully");

    // DELETE
    console.log("\n🗑️  Testing Question DELETE...");
    await axios.delete(`${API_BASE}/questions/${createdQuestionId}`, {
      headers,
    });
    console.log("✅ Question deleted successfully");

    return true;
  } catch (error) {
    console.error(
      "❌ Question CRUD failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function cleanup() {
  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    console.log("\n🧹 Cleaning up...");

    if (createdQuizId) {
      await axios.delete(`${API_BASE}/quizzes/${createdQuizId}`, { headers });
      console.log("✅ Quiz deleted");
    }

    if (createdEventId) {
      await axios.delete(`${API_BASE}/events/${createdEventId}`, { headers });
      console.log("✅ Event deleted");
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting CRUD Operations Test");
  console.log("================================\n");

  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log("\n❌ Tests aborted due to login failure");
    return;
  }

  const eventSuccess = await testEventCRUD();
  if (!eventSuccess) {
    console.log("\n❌ Tests aborted due to Event CRUD failure");
    return;
  }

  const quizSuccess = await testQuizCRUD();
  if (!quizSuccess) {
    console.log("\n❌ Tests aborted due to Quiz CRUD failure");
    await cleanup();
    return;
  }

  const questionSuccess = await testQuestionCRUD();
  if (!questionSuccess) {
    console.log("\n❌ Question CRUD failed");
  }

  await cleanup();

  console.log("\n================================");
  console.log("✅ All CRUD tests completed successfully!");
  console.log("================================\n");
}

runTests().catch((error) => {
  console.error("\n❌ Test suite error:", error.message);
  process.exit(1);
});
