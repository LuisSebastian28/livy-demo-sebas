import { useThreeCupsController } from './ThreeCupsController';
import ThreeCupsView from './ThreeCupsView';

/**
 * ThreeCups Tab - Thin connector between controller and view
 * Same pattern as PriceFeedTab
 */
export default function ThreeCupsTab() {
  const controllerProps = useThreeCupsController();
  
  return <ThreeCupsView {...controllerProps} />;
}