export const getColor = (probability) => {
    // Red to yellow to green gradient
    if (probability < 0.3) {
      return `rgba(255, 0, 0, ${0.2 + probability * 2})`; // More red for very low probs
    } else if (probability < 0.7) {
      return `rgba(255, ${Math.floor(255 * (probability - 0.3) / 0.4)}, 0, 0.5)`; // Yellow transition
    } else {
      return `rgba(0, 255, 0, ${probability * 0.5})`; // Green for high probs
    }
  };
