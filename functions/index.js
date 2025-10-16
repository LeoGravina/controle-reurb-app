// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");


admin.initializeApp();

// Função para CRIAR um novo usuário
exports.createUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) { throw new functions.https.HttpsError("unauthenticated", "Você precisa estar logado."); }
  const callerDoc = await admin.firestore().collection("users").doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") { throw new functions.https.HttpsError("permission-denied", "Você não tem permissão para criar usuários."); }

  const { email, password, fullName, username } = data;
  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: fullName });
    await admin.firestore().collection("users").doc(userRecord.uid).set({ email, fullName, username, role: "user" });
    return { result: `Usuário ${fullName} criado com sucesso.` };
  } catch (error) {
    if (error.code === "auth/email-already-exists") { throw new functions.https.HttpsError("already-exists", "Este e-mail já está em uso."); }
    throw new functions.https.HttpsError("internal", "Ocorreu um erro ao criar o usuário.");
  }
});

// Função para ATUALIZAR dados de um usuário
exports.updateUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) { throw new functions.https.HttpsError("unauthenticated", "Você precisa estar logado."); }
  const callerDoc = await admin.firestore().collection("users").doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") { throw new functions.https.HttpsError("permission-denied", "Você não tem permissão para editar usuários."); }

  const { uid, fullName, username, role } = data;
  try {
    const userToUpdateDoc = await admin.firestore().collection("users").doc(uid).get();
    if (!userToUpdateDoc.exists) { throw new functions.https.HttpsError("not-found", "Usuário não encontrado."); }
    const oldUsername = userToUpdateDoc.data().username;

    if (username !== oldUsername) {
      const snapshot = await admin.firestore().collection("users").where('username', '==', username).get();
      if (!snapshot.empty) { throw new functions.https.HttpsError("already-exists", "Este nome de usuário já está em uso."); }
    }
    await admin.firestore().collection("users").doc(uid).update({ fullName, username, role });
    return { result: `Usuário ${fullName} atualizado com sucesso.` };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) { throw error; }
    throw new functions.https.HttpsError("internal", "Ocorreu um erro ao atualizar o usuário.");
  }
});

// Função para EXCLUIR um usuário
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) { throw new functions.https.HttpsError("unauthenticated", "Você precisa estar logado."); }
  const callerDoc = await admin.firestore().collection("users").doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") { throw new functions.https.HttpsError("permission-denied", "Você não tem permissão para excluir usuários."); }

  const { uid } = data;
  try {
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();
    return { result: `Usuário excluído com sucesso.` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Ocorreu um erro ao excluir o usuário.");
  }
});

// ADICIONE ESTA NOVA FUNÇÃO DE TESTE
exports.testAuth = functions.https.onCall((data, context) => {
  // Se o objeto de autenticação não existir, retorne uma mensagem de erro clara.
  if (!context.auth) {
    return { 
      status: "Falha na autenticação.",
      message: "O objeto context.auth não foi encontrado no servidor." 
    };
  }

  // Se existir, retorne os dados do usuário para confirmar.
  return {
    status: "Autenticação bem-sucedida!",
    uid: context.auth.uid,
    email: context.auth.token.email,
  };
});