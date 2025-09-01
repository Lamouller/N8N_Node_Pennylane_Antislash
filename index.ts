import { Pennylane } from './src/nodes/Pennylane/Pennylane.node';
import { PennylaneTrigger } from './src/triggers/PennylaneTrigger/PennylaneTrigger.node';
import { PennylaneTokenApi } from './src/credentials/PennylaneTokenApi.credentials';
import { PennylaneOAuth2Api } from './src/credentials/PennylaneOAuth2Api.credentials';

export const nodes = [
  Pennylane,
  PennylaneTrigger,
];

export const credentials = [
  PennylaneTokenApi,
  PennylaneOAuth2Api,
];
