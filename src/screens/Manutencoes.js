import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  carregarDados,
  salvarDados,
} from "../storage/dados";

function converterNumero(valor) {
  return Number(String(valor).replace(",", "."));
}

export default function Manutencoes({ aoVoltar }) {
  const [manutencoes, setManutencoes] = useState([]);
  const [servico, setServico] = useState("");
  const [kmRealizada, setKmRealizada] = useState("");
  const [proximaKm, setProximaKm] = useState("");
  const [valor, setValor] = useState("");

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      const dados = await carregarDados();
      setManutencoes(dados.manutencoes);
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível carregar as manutenções.",
      );
    }
  }

  async function cadastrar() {
    const kmNumero = converterNumero(kmRealizada);
    const proximaNumero = converterNumero(proximaKm);
    const valorNumero = converterNumero(valor);

    if (!servico.trim()) {
      Alert.alert("Informe o serviço realizado.");
      return;
    }

    if (!Number.isFinite(kmNumero) || kmNumero < 0) {
      Alert.alert("Informe uma quilometragem válida.");
      return;
    }

    if (
      proximaKm &&
      (!Number.isFinite(proximaNumero) ||
        proximaNumero <= kmNumero)
    ) {
      Alert.alert(
        "A próxima revisão precisa ter uma quilometragem maior.",
      );
      return;
    }

    if (
      valor &&
      (!Number.isFinite(valorNumero) || valorNumero < 0)
    ) {
      Alert.alert("Informe um valor válido.");
      return;
    }

    const novaManutencao = {
      id: Date.now().toString(),
      servico: servico.trim(),
      kmRealizada: kmNumero,
      proximaKm: proximaKm ? proximaNumero : null,
      valor: valor ? valorNumero : null,
      data: new Date().toISOString(),
    };

    const novaLista = [novaManutencao, ...manutencoes];

    try {
      const dados = await carregarDados();

      await salvarDados({
        ...dados,
        manutencoes: novaLista,
      });

      setManutencoes(novaLista);
      setServico("");
      setKmRealizada("");
      setProximaKm("");
      setValor("");

      Alert.alert("Manutenção registrada 🍒");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível salvar a manutenção.",
      );
    }
  }

  function excluir(item) {
    Alert.alert(
      "Excluir manutenção?",
      item.servico,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",

          onPress: async () => {
            const novaLista = manutencoes.filter(
              (manutencao) => manutencao.id !== item.id,
            );

            const dados = await carregarDados();

            await salvarDados({
              ...dados,
              manutencoes: novaLista,
            });

            setManutencoes(novaLista);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        style={styles.preencher}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.conteudo}>
          <Pressable onPress={aoVoltar}>
            <Text style={styles.voltar}>‹ Voltar</Text>
          </Pressable>

          <Text style={styles.titulo}>Manutenções</Text>

          <Text style={styles.descricao}>
            Registre serviços e acompanhe as próximas revisões.
          </Text>

          <Campo
            titulo="Serviço realizado"
            valor={servico}
            aoAlterar={setServico}
            exemplo="Ex.: Troca de óleo"
            teclado="default"
          />

          <Campo
            titulo="Quilometragem"
            valor={kmRealizada}
            aoAlterar={setKmRealizada}
            exemplo="Ex.: 126500"
          />

          <Campo
            titulo="Próxima troca ou revisão · opcional"
            valor={proximaKm}
            aoAlterar={setProximaKm}
            exemplo="Ex.: 136500"
          />

          <Campo
            titulo="Valor pago · opcional"
            valor={valor}
            aoAlterar={setValor}
            exemplo="Ex.: 250,00"
          />

          <Pressable style={styles.botao} onPress={cadastrar}>
            <Text style={styles.botaoTexto}>
              Salvar manutenção
            </Text>
          </Pressable>

          <Text style={styles.subtitulo}>Histórico</Text>

          {manutencoes.length === 0 ? (
            <Text style={styles.vazio}>
              Nenhuma manutenção registrada.
            </Text>
          ) : (
            manutencoes.map((item) => (
              <Pressable
                key={item.id}
                style={styles.cartao}
                onLongPress={() => excluir(item)}
              >
                <View style={styles.linha}>
                  <Text style={styles.nome}>{item.servico}</Text>

                  {item.valor !== null && (
                    <Text style={styles.valor}>
                      R$ {item.valor.toFixed(2).replace(".", ",")}
                    </Text>
                  )}
                </View>

                <Text style={styles.detalhes}>
                  Realizada aos{" "}
                  {item.kmRealizada.toLocaleString("pt-BR")} km
                </Text>

                {item.proximaKm !== null && (
                  <Text style={styles.proxima}>
                    Próxima:{" "}
                    {item.proximaKm.toLocaleString("pt-BR")} km
                  </Text>
                )}
              </Pressable>
            ))
          )}

          <Text style={styles.observacao}>
            Segure um registro para excluí-lo.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Campo({
  titulo,
  valor,
  aoAlterar,
  exemplo,
  teclado = "decimal-pad",
}) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>{titulo}</Text>

      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={aoAlterar}
        placeholder={exemplo}
        placeholderTextColor="#78676d"
        keyboardType={teclado}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  preencher: {
    flex: 1,
  },

  tela: {
    flex: 1,
    backgroundColor: "#100d0f",
  },

  conteudo: {
    padding: 22,
    paddingBottom: 50,
  },

  voltar: {
    marginBottom: 20,
    color: "#e7a2b1",
    fontSize: 15,
  },

  titulo: {
    color: "#f5e9e8",
    fontFamily: "Georgia",
    fontSize: 32,
  },

  descricao: {
    marginTop: 8,
    color: "#bda5ad",
    fontSize: 13,
    lineHeight: 19,
  },

  grupo: {
    marginTop: 20,
  },

  label: {
    marginBottom: 8,
    color: "#bda5ad",
    fontSize: 12,
  },

  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#54303c",
    borderRadius: 10,
    backgroundColor: "#1d1519",
    color: "#f5e9e8",
  },

  botao: {
    alignItems: "center",
    marginTop: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#b52f50",
  },

  botaoTexto: {
    color: "#fff5f7",
    fontSize: 14,
    fontWeight: "700",
  },

  subtitulo: {
    marginTop: 30,
    marginBottom: 13,
    color: "#f5e9e8",
    fontFamily: "Georgia",
    fontSize: 21,
  },

  cartao: {
    marginBottom: 11,
    padding: 17,
    borderWidth: 1,
    borderColor: "#412a33",
    borderRadius: 12,
    backgroundColor: "#1d1519",
  },

  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },

  nome: {
    flex: 1,
    color: "#f5e9e8",
    fontSize: 14,
    fontWeight: "600",
  },

  valor: {
    color: "#e7a2b1",
    fontSize: 13,
  },

  detalhes: {
    marginTop: 8,
    color: "#bda5ad",
    fontSize: 11,
  },

  proxima: {
    marginTop: 6,
    color: "#e7a2b1",
    fontSize: 11,
  },

  vazio: {
    padding: 20,
    color: "#bda5ad",
    textAlign: "center",
  },

  observacao: {
    marginTop: 20,
    color: "#806f75",
    fontSize: 10,
    textAlign: "center",
  },
});