import axios from "axios";
const BASE_URL = "https://visionary-ai-eyheh5emgzaubaad.eastus2-01.azurewebsites.net/api";

const get_ai_response_key = process.env.REACT_APP_GET_AI_RESPONSE;
const onboarding_key = process.env.REACT_APP_ONBOARDING;
const update_embedding_key = process.env.REACT_APP_UPDATE_EMBEDDING;

/**
 * Calls the get_ai_response endpoint.
 * @param {string} username
 * @param {string} user_query
 * @param {Array} image_parts
 * @returns {Promise<Object>}
 */
export async function getAIResponse(username, user_query, image_parts = []) {
  const url = `${BASE_URL}/get_ai_response?code=${get_ai_response_key}`;
  const body = {
    username,
    user_query,
    image_parts,
  };
  try {
    const response = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to get AI response");
  }
}

/**
 * Calls the onboarding endpoint.
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function onboarding(username) {
  const url = `${BASE_URL}/onboarding?code=${onboarding_key}`;
  const body = { username };
  try {
    const response = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to onboard user");
  }
}

/**
 * Calls the update_embedding endpoint.
 * @param {string} username
 * @param {Array} image_parts
 * @param {string} user_query
 * @returns {Promise<Object>}
 */
export async function updateEmbedding(username, image_parts = [], user_query = "") {
  const url = `${BASE_URL}/update_embedding?code=${update_embedding_key}`;
  const body = { username, image_parts, user_query };
  try {
    const response = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to update embedding");
  }
}
