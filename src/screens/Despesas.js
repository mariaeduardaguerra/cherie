import { useEffect, useMemo, useState } from "react";
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

const categorias = [
  "Combustível",
  "Manutenção",
  "Seguro",
  "Parcela",
  "Acessórios",
  "Outros",
];

function converterNumero(valor) {
  return Number(String(valor).replace(",", "."));
}

function formatarDinheiro(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

export default function Despesas({ aoVoltar }) {
  const [despesas, setDespesas] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Combustível");

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      const dados = await carregarDados();
      setDespesas(dados.despesas);
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível carregar as despesas.",
      );
    }
  }

  const total = useMemo(() => {
    return despesas.reduce(
      (soma, despesa) => soma + despesa.valor,
      0,
    );
  }, [despesas]);

  async function cadastrar() {
    const valorNumero = converterNumero(valor);

    if (!descricao.trim()) {
      Alert.alert("Informe a descrição da despesa.");
      return;
    }

    if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
      Alert.alert("Informe um valor válido.");
      return;
    }

    const novaDespesa = {
      id: Date.now().toString(),
      descricao: descricao.trim(),
      valor: valorNumero,
      categoria,
      data: new Date().toISOString(),
    };

    const novaLista = [novaDespesa, ...despesas];

    try {
      const dados = await carregarDados();

      await salvarDados({
        ...dados,
        despesas: novaLista,
      });

      setDespesas(novaLista);
      setDescricao("");
      setValor("");

      Alert.alert("Despesa registrada 🍒");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível salvar a despesa.",
      );
    }
  }

  function excluir(item) {
    Alert.alert(
      "Excluir despesa?",
      item.descricao,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",

          onPress: async () => {
            const novaLista = despesas.filter(
              (despesa) => despesa.id !== item.id,
            );

            const dados = await carregarDados();

            await salvarDados({
              ...dados,
              despesas: novaLista,
            });

            setDespesas(novaLista);
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
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={aoVoltar}>
            <Text style={styles.voltar}>‹ Voltar</Text>
          </Pressable>

          <Text style={styles.titulo}>Despesas</Text>

          <Text style={styles.descricaoPagina}>
            Acompanhe quanto o Chérie custa por categoria.
          </Text>

          <View style={styles.resumo}>
            <Text style={styles.resumoRotulo}>
              TOTAL REGISTRADO
            </Text>

            <Text style={styles.resumoValor}>
              {formatarDinheiro(total)}
            </Text>

            <Text style={styles.resumoDetalhe}>
              {despesas.length} despesa(s)
            </Text>
          </View>

          <Text style={styles.label}>Descrição</Text>

          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ex.: Gasolina"
            placeholderTextColor="#78676d"
            maxLength={100}
          />

          <Text style={styles.label}>Valor</Text>

          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="Ex.: 200,00"
            placeholderTextColor="#78676d"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Categoria</Text>

          <View style={styles.categorias}>
            {categorias.map((item) => {
              const selecionada = item === categoria;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.categoria,
                    selecionada &&
                      styles.categoriaSelecionada,
                  ]}
                  onPress={() => setCategoria(item)}
                >
                  <Text
                    style={[
                      styles.categoriaTexto,
                      selecionada &&
                        styles.categoriaTextoSelecionada,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.botao} onPress={cadastrar}>
            <Text style={styles.botaoTexto}>
              Salvar despesa
            </Text>
          </Pressable>

          <Text style={styles.subtitulo}>Histórico</Text>

          {despesas.length === 0 ? (
            <Text style={styles.vazio}>
              Nenhuma despesa registrada.
            </Text>
          ) : (
            despesas.map((item) => (
              <Pressable
                key={item.id}
                style={styles.cartao}
                onLongPress={() => excluir(item)}
              >
                <View style={styles.linha}>
                  <View style={styles.informacoes}>
                    <Text style={styles.nome}>
                      {item.descricao}
                    </Text>

                    <Text style={styles.categoriaHistorico}>
                      {item.categoria}
                    </Text>
                  </View>

                  <Text style={styles.valorHistorico}>
                    {formatarDinheiro(item.valor)}
                  </Text>
                </View>
              </Pressable>
            ))
          )}

          <Text style={styles.observacao}>
            Segure uma despesa para excluí-la.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

  descricaoPagina: {
    marginTop: 8,
    color: "#bda5ad",
    fontSize: 13,
    lineHeight: 19,
  },

  resumo: {
    marginTop: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#54303c",
    borderRadius: 15,
    backgroundColor: "#28191f",
  },

  resumoRotulo: {
    color: "#e7a2b1",
    fontSize: 10,
    letterSpacing: 2,
  },

  resumoValor: {
    marginTop: 12,
    color: "#f5e9e8",
    fontFamily: "Georgia",
    fontSize: 29,
  },

  resumoDetalhe: {
    marginTop: 7,
    color: "#bda5ad",
    fontSize: 11,
  },

  label: {
    marginTop: 20,
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

  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoria: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#54303c",
    borderRadius: 20,
    backgroundColor: "#1d1519",
  },

  categoriaSelecionada: {
    borderColor: "#b52f50",
    backgroundColor: "#b52f50",
  },

  categoriaTexto: {
    color: "#bda5ad",
    fontSize: 11,
  },

  categoriaTextoSelecionada: {
    color: "#fff5f7",
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
    marginBottom: 10,
    padding: 17,
    borderWidth: 1,
    borderColor: "#412a33",
    borderRadius: 12,
    backgroundColor: "#1d1519",
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },

  informacoes: {
    flex: 1,
  },

  nome: {
    color: "#f5e9e8",
    fontSize: 14,
    fontWeight: "600",
  },

  categoriaHistorico: {
    marginTop: 6,
    color: "#bda5ad",
    fontSize: 11,
  },

  valorHistorico: {
    color: "#e7a2b1",
    fontSize: 14,
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