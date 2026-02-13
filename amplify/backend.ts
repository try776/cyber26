import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource'; // Falls du eine Datenbank hast

const backend = defineBackend({
  auth,
  data, // Falls vorhanden
});

// Hier ist der korrekte Ort für den Override:
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};