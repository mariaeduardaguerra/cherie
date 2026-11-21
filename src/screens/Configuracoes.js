import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function converterNumero(valor) {
  return Number(String(valor).replace(",", "."));
}

export default function Configuracoes({
  capacidadeInicial,
  aoSalvar,
  aoVoltar,
}) {
  const [capacidade, setCapacidade] = useState(
    String(capacidadeInicial),
  );

  function confirmar() {
    const numero = converterNumero(capacidade);

    if (
      !Number.isFinite(numero) ||
      numero < 20 ||
      numero > 100
    ) {
      Alert.alert(
        "Capacidade inválida",
        "Informe um valor entre 20 e 100 litros.",
      );
      return;
    }

    aoSalvar(numero);
  }

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <Pressable onPress={aoVoltar}>
          <Text style={styles.voltar}>‹ Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Configurações</Text>

        <Text style={styles.descricao}>
          Ajuste as informações usadas nos cálculos do Chérie.
        </Text>

        <View style={styles.carro}>
          <Text style={styles.rotulo}>VEÍCULO</Text>
          <Text style={styles.nome}>Citroën C3</Text>
          <Text style={styles.detalhes}>
            2011 · 1.4 · Gasolina
          </Text>
        </View>

        <Text style={styles.label}>
          Capacidade total do tanque
        </Text>

        <View style={styles.campo}>
          <TextInput
            style={styles.input}
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType="decimal-pad"
            placeholder="Ex.: 47"
            placeholderTextColor="#78676d"
          />

          <Text style={styles.sufixo}>litros</Text>
        </View>

        <Text style={styles.ajuda}>
          Confira este valor no manual do veículo. Ele influencia
          diretamente a estimativa de combustível restante.
        </Text>

        <View style={styles.aviso}>
          <Text style={styles.avisoTitulo}>
            Margem de segurança
          </Text>

          <Text style={styles.avisoTexto}>
            O aplicativo reserva 15% do tanque antes de mostrar a
            autonomia disponível. Essa margem continua sendo apenas
            uma estimativa.
          </Text>
        </View>

        <Pressable style={styles.botao} onPress={confirmar}>
          <Text style={styles.botaoTexto}>
            Salvar configurações
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#100d0f",
  },

  conteudo: {
    padding: 22,
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

  carro: {
    marginTop: 25,
    padding: 22,
    borderWidth: 1,
    borderColor: "#54303c",
    borderRadius: 15,
    backgroundColor: "#28191f",
  },

  rotulo: {
    color: "#e7a2b1",
    fontSize: 10,
    letterSpacing: 2,
  },

  nome: {
    marginTop: 10,
    color: "#f5e9e8",
    fontFamily: "Georgia",
    fontSize: 25,
  },

  detalhes: {
    marginTop: 7,
    color: "#bda5ad",
    fontSize: 12,
  },

  label: {
    marginTop: 25,
    marginBottom: 8,
    color: "#bda5ad",
    fontSize: 12,
  },

  campo: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#54303c",
    borderRadius: 10,
    backgroundColor: "#1d1519",
  },

  input: {
    flex: 1,
    padding: 14,
    color: "#f5e9e8",
  },

  sufixo: {
    paddingRight: 14,
    color: "#e7a2b1",
    fontSize: 12,
  },

  ajuda: {
    marginTop: 9,
    color: "#806f75",
    fontSize: 10,
    lineHeight: 16,
  },

  aviso: {
    marginTop: 22,
    padding: 17,
    borderLeftWidth: 3,
    borderLeftColor: "#b52f50",
    borderRadius: 10,
    backgroundColor: "#25141a",
  },

  avisoTitulo: {
    color: "#e7a2b1",
    fontSize: 13,
    fontWeight: "600",
  },

  avisoTexto: {
    marginTop: 7,
    color: "#bda5ad",
    fontSize: 11,
    lineHeight: 17,
  },

  botao: {
    alignItems: "center",
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#b52f50",
  },

  botaoTexto: {
    color: "#fff5f7",
    fontSize: 14,
    fontWeight: "700",
  },
});