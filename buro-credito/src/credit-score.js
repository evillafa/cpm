/**
 * Credit score generation module
 * Generates deterministic credit scores based on customer data
 */

/**
 * Generate a credit score based on customer data
 * @param {Object} customerData - Customer information
 * @returns {Object} Credit score information
 */
export function generateCreditScore(customerData) {
  // Extract CURP for deterministic scoring
  const { curp, fullName } = customerData;
  
  // Generate deterministic score based on CURP
  const scoreValue = generateScoreValue(curp);
  
  // Determine risk tier based on score
  const riskTier = determineRiskTier(scoreValue);
  
  return {
    model: 'CajaPopular-V1',
    value: scoreValue,
    riskTier: riskTier
  };
}

/**
 * Generate a deterministic score value based on CURP
 * @param {string} curp - Customer's CURP
 * @returns {number} Score value between 600-780
 */
function generateScoreValue(curp) {
  if (!curp) return 650; // Default score
  
  // Use character codes from CURP to generate a deterministic score
  let sum = 0;
  for (let i = 0; i < curp.length; i++) {
    sum += curp.charCodeAt(i);
  }
  
  // Generate score between 600-780
  return 600 + (sum % 181);
}

/**
 * Determine risk tier based on score value
 * @param {number} scoreValue - Credit score value
 * @returns {string} Risk tier (LOW, MEDIUM, HIGH)
 */
function determineRiskTier(scoreValue) {
  if (scoreValue >= 730) return 'LOW';
  if (scoreValue >= 660) return 'MEDIUM';
  return 'HIGH';
}
