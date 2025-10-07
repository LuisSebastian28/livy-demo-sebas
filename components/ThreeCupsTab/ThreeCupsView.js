import ServiceResponse from '../shared/ServiceResponse';
import styles from './ThreeCupsTab.module.css';

/**
 * ThreeCups View - Pure templating and rendering
 * Takes controller state/handlers as props and renders UI
 */
export default function ThreeCupsView({
  loading,
  parsedResponse,
  selectedCup,
  gameState,
  handleCupSelect,
  resetGame,
  serviceId,
  inputParams
}) {
  const isShuffling = gameState === 'shuffling';
  const showResult = gameState === 'result';
  const canSelect = !loading && gameState === 'idle';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Three Cups Game 🎯</h2>
        <p className={styles.description}>
          Watch carefully as the cups shuffle! Choose the cup you think contains the ball. 
          The game runs in a Trusted Execution Environment (TEE) to ensure fair and verifiable results.
        </p>
        <p className={styles.subtitle}>
          Click on any cup to make your selection. The result is cryptographically certified by Livy.
        </p>
      </div>

      {/* Cups Display */}
      <div className={styles.cupsSection}>
        <div className={styles.cupsContainer}>
          {[0, 1, 2].map((cupIndex) => (
            <button
              key={cupIndex}
              onClick={() => handleCupSelect(cupIndex)}
              disabled={!canSelect}
              className={`${styles.cup} ${
                selectedCup === cupIndex ? styles.cupSelected : ''
              } ${isShuffling ? styles.cupShuffling : ''} ${
                showResult && parsedResponse?.extractedData?.ballPosition === cupIndex 
                  ? styles.cupWithBall 
                  : ''
              }`}
            >
              <div className={styles.cupBody}>
                {/* Cup number */}
                <div className={styles.cupNumber}>{cupIndex + 1}</div>
                
                {/* Ball reveal animation */}
                {showResult && parsedResponse?.extractedData?.ballPosition === cupIndex && (
                  <div className={styles.ball}></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Game Status */}
        <div className={styles.gameStatus}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <span>Shuffling cups and verifying in TEE...</span>
            </div>
          )}
          
          {canSelect && (
            <div className={styles.readyState}>
              <span>🎪 Choose your cup!</span>
            </div>
          )}
          
          {showResult && parsedResponse && (
            <div className={`${styles.resultState} ${
              parsedResponse.extractedData?.won ? styles.win : styles.lose
            }`}>
              <span>
                {parsedResponse.extractedData?.won ? '🎉 You Won!' : '💔 You Lost!'}
              </span>
              <button 
                onClick={resetGame}
                className={styles.playAgainButton}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Response */}
      <ServiceResponse 
        parsedResponse={parsedResponse}
        loading={loading}
        serviceId={serviceId}
        inputParams={inputParams}
      />
    </div>
  );
}