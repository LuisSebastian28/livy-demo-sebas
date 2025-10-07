import { useState } from 'react';
import { runService } from '../../lib/livy';
import { parseServiceResponse } from '../../lib/responseParser';

export function useThreeCupsController() {
  const [loading, setLoading] = useState(false);
  const [parsedResponse, setParsedResponse] = useState(null);
  const [selectedCup, setSelectedCup] = useState(null);
  const [gameState, setGameState] = useState('idle');

  const handleCupSelect = async (cupIndex) => {
    if (loading || gameState === 'shuffling') return;
    
    setLoading(true);
    setSelectedCup(cupIndex);
    setGameState('shuffling');
    setParsedResponse(null);

    try {
      console.log('🎮 Llamando Livy con cup (como string):', cupIndex.toString());
      
      // CONVERTIR a string - Livy espera "--guess 1" como string, no número
      const response = await runService({
        serviceId: "",
        params: { guess: cupIndex.toString() }, // ← CAMBIO IMPORTANTE: .toString()
        withAttestation: true,
        postToDataAvailability: false
      });
      
      console.log('✅ Respuesta de Livy:', response);
      
      const parsed = parseServiceResponse(response, null, 'three-cups');
      setParsedResponse(parsed);
      setGameState('result');
      
    } catch (error) {
      console.error('❌ Error de Livy:', error);
      
      const parsed = parseServiceResponse(null, error, 'three-cups');
      setParsedResponse(parsed);
      setGameState('result');
      
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setSelectedCup(null);
    setParsedResponse(null);
    setGameState('idle');
  };

  return {
    loading,
    parsedResponse,
    selectedCup,
    gameState,
    handleCupSelect,
    resetGame,
    serviceId: "5c464ccb-789d-44a5-993e-deefe0d8df9b",
    inputParams: selectedCup !== null ? { guess: selectedCup.toString() } : null // ← También aquí
  };
}