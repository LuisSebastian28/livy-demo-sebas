/**
 * Service-specific message extractors for TEE function outputs
 * Extracts meaningful data from cleaned log messages
 */

/**
 * Extract meaningful data from service messages based on service type
 * @param {string} cleanMessage - Cleaned message from TEE function
 * @param {string} serviceType - Type of service
 * @param {boolean} isSuccess - Whether this was a successful response
 * @returns {Object} Extracted data with user-friendly message
 */
export function extractServiceMessage(cleanMessage, serviceType, isSuccess) {
  switch (serviceType) {
    case 'sequence':
    case 'next_number':
      return extractSequenceMessage(cleanMessage, isSuccess);
    
    case 'time-aware':
      return extractTimeAwareMessage(cleanMessage, isSuccess);
    
    case 'coin-toss':
      return extractCoinTossMessage(cleanMessage, isSuccess);
    
    case 'price-feed':
      return extractPriceFeedMessage(cleanMessage, isSuccess);
    
    case 'three-cups':  // ← NUEVO CASE
      return extractThreeCupsMessage(cleanMessage, isSuccess);
    
    default:
      return {
        userFriendlyMessage: isSuccess ? 'Operation completed successfully!' : 'Operation failed',
        rawData: cleanMessage
      };
  }
}

/**
 * Extract data from three-cups service
 */
function extractThreeCupsMessage(cleanMessage, isSuccess) {
  if (isSuccess) {
    try {
      // Intentar extraer JSON del output
      const jsonMatch = cleanMessage.match(/JSON Output:\s*(\{[\s\S]*\})/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        return {
          userFriendlyMessage: jsonData.won 
            ? '🎉 You won! The ball was under your chosen cup!' 
            : '💔 You lost! The ball was under a different cup.',
          won: jsonData.won,
          userGuess: jsonData.user_guess,
          ballPosition: jsonData.ball_position,
          timestamp: jsonData.timestamp
        };
      }
      
      // Fallback: buscar información en texto plano
      const winMatch = cleanMessage.match(/WINNER! 🎉/);
      const loseMatch = cleanMessage.match(/Try again! 😔/);
      const ballMatch = cleanMessage.match(/Ball position: (\d+)/);
      const guessMatch = cleanMessage.match(/User guess: (\d+)/);
      
      if (winMatch || loseMatch) {
        const won = !!winMatch;
        const ballPosition = ballMatch ? parseInt(ballMatch[1]) : null;
        const userGuess = guessMatch ? parseInt(guessMatch[1]) : null;
        
        return {
          userFriendlyMessage: won 
            ? '🎉 You won! The ball was under your chosen cup!' 
            : '💔 You lost! The ball was under a different cup.',
          won,
          userGuess,
          ballPosition,
          timestamp: new Date().toISOString()
        };
      }
    } catch (parseError) {
      // Si falla el parsing, retornar éxito básico
    }
    
    return {
      userFriendlyMessage: 'Game completed successfully!',
      won: false
    };
  } else {
    // Para errores, manejarlos como pérdida (similar a coin-toss)
    if (cleanMessage.includes('RA service execution failed') || cleanMessage.includes('INVALID_PARAMS')) {
      return {
        userFriendlyMessage: '💔 Game failed! Please try again.',
        won: false
      };
    }
    
    return {
      userFriendlyMessage: 'Game service error. Please try again.',
      won: false
    };
  }
}

/**
 * Extract data from sequence/next_number service
 */
function extractSequenceMessage(cleanMessage, isSuccess) {
  if (isSuccess) {
    // Success: "✅ Success! Number 5 is certified as correct."
    const successMatch = cleanMessage.match(/✅ Success! Number (\d+) is certified as correct/);
    if (successMatch) {
      return {
        userFriendlyMessage: `🎉 Correct! You got it right! The answer is indeed ${successMatch[1]}.`,
        number: parseInt(successMatch[1]),
        correct: true
      };
    }
    return {
      userFriendlyMessage: '🎉 Correct! You got the right answer!',
      correct: true
    };
  } else {
    // Error: "assertion `left == right` failed: You've got the wrong number! Expected 5, got 3"
    const errorMatch = cleanMessage.match(/You've got the wrong number! Expected (\d+), got (\d+)/);
    if (errorMatch) {
      const expected = errorMatch[1];
      const actual = errorMatch[2];
      return {
        userFriendlyMessage: `Wrong answer! 🤔 Expected ${expected}, but you entered ${actual}. Try again!`,
        expected: parseInt(expected),
        actual: parseInt(actual),
        correct: false
      };
    }
    return {
      userFriendlyMessage: 'Incorrect answer! Try again!',
      correct: false
    };
  }
}

/**
 * Extract data from time-aware service
 */
function extractTimeAwareMessage(cleanMessage, isSuccess) {
  if (isSuccess) {
    // Success: "✅ Success! You correctly identified 25 minutes left until the next hour."
    const successMatch = cleanMessage.match(/✅ Success! You correctly identified (\d+) minutes left/);
    if (successMatch) {
      return {
        userFriendlyMessage: `🎉 Correct! You calculated the time correctly! ${successMatch[1]} minutes remaining.`,
        minutes: parseInt(successMatch[1]),
        correct: true
      };
    }
    return {
      userFriendlyMessage: '🎉 Correct! You calculated the time correctly!',
      correct: true
    };
  } else {
    // Error: "Expected 25 minutes left, but you said 30"
    const errorMatch = cleanMessage.match(/Expected (\d+) minutes left, but you said (\d+)/);
    if (errorMatch) {
      const expected = errorMatch[1];
      const actual = errorMatch[2];
      return {
        userFriendlyMessage: `Wrong time calculation! ⏰ Expected ${expected} minutes, but you entered ${actual}. Try again!`,
        expected: parseInt(expected),
        actual: parseInt(actual),
        correct: false
      };
    }
    return {
      userFriendlyMessage: 'Incorrect time calculation! Try again!',
      correct: false
    };
  }
}

/**
 * Extract data from coin-toss service
 */
function extractCoinTossMessage(cleanMessage, isSuccess) {
  if (isSuccess) {
    // Success: "🎉 You WIN! Your guess 'head' matches the server result 'head'!"
    const winMatch = cleanMessage.match(/🎉 You WIN! Your guess '(\w+)' matches the server result '(\w+)'/);
    if (winMatch) {
      const guess = winMatch[1];
      const result = winMatch[2];
      return {
        userFriendlyMessage: `🎉 You Won! You guessed ${guess === 'head' ? 'heads' : 'tails'} and the coin landed on ${result === 'head' ? 'heads' : 'tails'}!`,
        userGuess: guess === 'head' ? 'heads' : 'tails',
        coinResult: result === 'head' ? 'heads' : 'tails',
        won: true
      };
    }
    return {
      userFriendlyMessage: '🎉 You Won!',
      won: true
    };
  } else {
    // Error: "assertion `left == right` failed: You LOSE! You guessed 'head' but the coin landed on 'tail'"
    const loseMatch = cleanMessage.match(/You LOSE! You guessed '(\w+)' but the coin landed on '(\w+)'/);
    if (loseMatch) {
      const guess = loseMatch[1];
      const result = loseMatch[2];
      return {
        userFriendlyMessage: `💔 You Lost! You guessed ${guess === 'head' ? 'heads' : 'tails'} and the coin landed on ${result === 'head' ? 'heads' : 'tails'}!`,
        userGuess: guess === 'head' ? 'heads' : 'tails',
        coinResult: result === 'head' ? 'heads' : 'tails',
        won: false
      };
    }
    
    // Fallback for generic RA service errors - we know it's a loss but don't have details
    if (cleanMessage.includes('RA service execution failed') || cleanMessage.includes('INVALID_PARAMS')) {
      return {
        userFriendlyMessage: '💔 You Lost! The coin had other plans.',
        won: false
      };
    }
    
    return {
      userFriendlyMessage: '💔 You Lost! Better luck next time!',
      won: false
    };
  }
}

/**
 * Extract data from price-feed service
 */
function extractPriceFeedMessage(cleanMessage, isSuccess) {
  if (isSuccess) {
    try {
      // Try to extract JSON from the message
      const jsonMatch = cleanMessage.match(/JSON Output:\s*(\{[\s\S]*\})/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        return {
          userFriendlyMessage: `💰 Successfully fetched ${jsonData.symbol} price: $${jsonData.price_usd?.toLocaleString() || jsonData.raw_price}`,
          priceData: jsonData,
          symbol: jsonData.symbol,
          price: jsonData.price_usd || parseFloat(jsonData.raw_price),
          timestamp: jsonData.timestamp,
          source: jsonData.source,
          certified: jsonData.certified
        };
      }
      
      // Fallback: look for price information in text
      const priceMatch = cleanMessage.match(/Price \(USD\): \$([0-9,]+\.?\d*)/);
      const symbolMatch = cleanMessage.match(/Symbol: ([A-Z-]+)/);
      
      if (priceMatch) {
        return {
          userFriendlyMessage: `💰 Successfully fetched price: $${priceMatch[1]}`,
          price: parseFloat(priceMatch[1].replace(/,/g, '')),
          symbol: symbolMatch ? symbolMatch[1] : 'Unknown',
          certified: true
        };
      }
    } catch (parseError) {
      // If JSON parsing fails, return basic success
    }
    
    return {
      userFriendlyMessage: '💰 Successfully fetched price data',
      certified: true
    };
  } else {
    return {
      userFriendlyMessage: 'Failed to fetch price data. Please try again.',
      certified: false
    };
  }
} 