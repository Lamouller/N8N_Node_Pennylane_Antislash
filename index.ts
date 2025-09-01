import { Pennylane } from './src/nodes/Pennylane/Pennylane.node';
import { PennylaneTrigger } from './src/triggers/PennylaneTrigger/PennylaneTrigger.node';
import { PennylaneTokenApi } from './src/credentials/PennylaneTokenApi.credentials';

export const nodes = [
  Pennylane,
  PennylaneTrigger,
];

export const credentials = [
  PennylaneTokenApi,
];
