import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_DADOS = "@cherie:dados";

export const dadosIniciais = {
  capacidadeTanque: 47,
  quilometragemAtual: "",
  abastecimentos: [],
  manutencoes: [],
  despesas: [],
};

export async function carregarDados() {
  const conteudo = await AsyncStorage.getItem(CHAVE_DADOS);

  if (!conteudo) {
    return dadosIniciais;
  }

  const dadosSalvos = JSON.parse(conteudo);

  return {
    ...dadosIniciais,
    ...dadosSalvos,

    abastecimentos: dadosSalvos.abastecimentos || [],
    manutencoes: dadosSalvos.manutencoes || [],
    despesas: dadosSalvos.despesas || [],
  };
}

export async function salvarDados(dados) {
  await AsyncStorage.setItem(
    CHAVE_DADOS,
    JSON.stringify(dados),
  );
}