import {
  carregarDados as carregarDadosGerais,
  salvarDados as salvarDadosGerais,
} from "./src/storage/dados";

import Manutencoes from "./src/screens/Manutencoes";

import Despesas from "./src/screens/Despesas";

import Configuracoes from "./src/screens/Configuracoes";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { StatusBar } from "expo-status-bar";

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

const CHAVE_DADOS = "@cherie:combustivel";

const cores = {
  fundo: "#100d0f",

  painel: "#1d1519",

  painelClaro: "#28191f",

  borda: "#54303c",

  cereja: "#b52f50",

  rosa: "#e7a2b1",

  texto: "#f5e9e8",

  suave: "#bda5ad",

  alerta: "#ffb1c1",
};

function converterNumero(valor) {
  return Number(String(valor).replace(",", "."));
}

function formatarDinheiro(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",

    currency: "BRL",
  }).format(valor || 0);
}

export default function App() {
  const [tela, setTela] = useState("inicio");

  const [carregando, setCarregando] = useState(true);

  const [capacidade, setCapacidade] = useState(47);

  const [quilometragemAtual, setQuilometragemAtual] = useState("");

  const [abastecimentos, setAbastecimentos] = useState([]);

  const [km, setKm] = useState("");

  const [litros, setLitros] = useState("");

  const [valor, setValor] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const dadosSalvos = await AsyncStorage.getItem(CHAVE_DADOS);

      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);

        setCapacidade(dados.capacidade || 47);

        setQuilometragemAtual(
          dados.quilometragemAtual ? String(dados.quilometragemAtual) : "",
        );

        setAbastecimentos(dados.abastecimentos || []);
      }
    } catch {
      Alert.alert(
        "Não foi possível carregar",

        "Os dados salvos não puderam ser lidos.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function salvarDados(novosDados) {
    try {
      await AsyncStorage.setItem(CHAVE_DADOS, JSON.stringify(novosDados));
    } catch {
      Alert.alert("Erro ao salvar", "Não foi possível guardar as informações.");
    }
  }

  const consumoMedio = useMemo(() => {
    if (abastecimentos.length < 2) {
      return null;
    }

    const consumos = [];

    for (let indice = 1; indice < abastecimentos.length; indice++) {
      const anterior = abastecimentos[indice - 1];

      const atual = abastecimentos[indice];

      const distancia = atual.km - anterior.km;

      if (distancia > 0 && atual.litros > 0) {
        const consumo = distancia / atual.litros;

        if (consumo >= 3 && consumo <= 25) {
          consumos.push(consumo);
        }
      }
    }

    if (consumos.length === 0) {
      return null;
    }

    const total = consumos.reduce((soma, consumo) => soma + consumo, 0);

    return total / consumos.length;
  }, [abastecimentos]);

  const estimativa = useMemo(() => {
    if (abastecimentos.length === 0 || !quilometragemAtual) {
      return null;
    }

    const ultimo = abastecimentos[abastecimentos.length - 1];

    const kmAtualNumero = converterNumero(quilometragemAtual);

    const distancia = kmAtualNumero - ultimo.km;

    if (!Number.isFinite(distancia) || distancia < 0) {
      return null;
    }

    // Até conhecer o consumo real, usa uma margem conservadora.

    const consumoUsado = consumoMedio || 8;

    const litrosConsumidos = distancia / consumoUsado;

    const litrosRestantes = Math.max(0, capacidade - litrosConsumidos);

    // Reserva de segurança de 15% do tanque.

    const reserva = capacidade * 0.15;

    const litrosDisponiveis = Math.max(0, litrosRestantes - reserva);

    return {
      distancia,

      litrosRestantes,

      autonomiaSegura: litrosDisponiveis * consumoUsado,

      consumoUsado,
    };
  }, [abastecimentos, capacidade, consumoMedio, quilometragemAtual]);

  async function registrarAbastecimento() {
    const kmNumero = converterNumero(km);

    const litrosNumero = converterNumero(litros);

    const valorNumero = converterNumero(valor);

    if (
      !Number.isFinite(kmNumero) ||
      !Number.isFinite(litrosNumero) ||
      !Number.isFinite(valorNumero)
    ) {
      Alert.alert(
        "Confira os dados",

        "Preencha quilometragem, litros e valor.",
      );

      return;
    }

    if (kmNumero < 0 || litrosNumero <= 0 || valorNumero <= 0) {
      Alert.alert(
        "Valores inválidos",

        "Os números precisam ser maiores que zero.",
      );

      return;
    }

    const ultimo = abastecimentos[abastecimentos.length - 1];

    if (ultimo && kmNumero <= ultimo.km) {
      Alert.alert(
        "Quilometragem inválida",

        `Informe um valor maior que ${ultimo.km} km.`,
      );

      return;
    }

    if (litrosNumero > capacidade + 2) {
      Alert.alert(
        "Confira os litros",

        "O valor informado parece maior que a capacidade do tanque.",
      );

      return;
    }

    const novoRegistro = {
      id: Date.now().toString(),

      km: kmNumero,

      litros: litrosNumero,

      valor: valorNumero,

      tanqueCheio: true,

      data: new Date().toISOString(),
    };

    const novaLista = [...abastecimentos, novoRegistro];

    const dadosGerais = await carregarDadosGerais();

    const despesaCombustivel = {
      id: `combustivel-${novoRegistro.id}`,

      descricao: `Abastecimento de ${litrosNumero.toFixed(1)} litros`,

      valor: valorNumero,

      categoria: "Combustível",

      data: novoRegistro.data,
    };

    await salvarDadosGerais({
      ...dadosGerais,

      despesas: [despesaCombustivel, ...dadosGerais.despesas],
    });

    setAbastecimentos(novaLista);

    setQuilometragemAtual(String(kmNumero));

    await salvarDados({
      capacidade,

      quilometragemAtual: kmNumero,

      abastecimentos: novaLista,
    });

    setKm("");

    setLitros("");

    setValor("");

    setTela("inicio");

    Alert.alert("Abastecimento registrado 🍒", "A estimativa foi atualizada.");
  }

  async function atualizarQuilometragem() {
    const numero = converterNumero(quilometragemAtual);

    const ultimo = abastecimentos[abastecimentos.length - 1];

    if (!Number.isFinite(numero) || numero < 0) {
      Alert.alert(
        "Quilometragem inválida",

        "Informe a quilometragem atual do carro.",
      );

      return;
    }

    if (ultimo && numero < ultimo.km) {
      Alert.alert(
        "Quilometragem inválida",

        `O valor não pode ser menor que ${ultimo.km} km.`,
      );

      return;
    }

    await salvarDados({
      capacidade,

      quilometragemAtual: numero,

      abastecimentos,
    });

    setQuilometragemAtual(String(numero));

    Alert.alert("Quilometragem atualizada", "A autonomia foi recalculada.");
  }

  function excluirRegistro(registro) {
    Alert.alert(
      "Excluir abastecimento?",

      `Registro de ${registro.litros.toFixed(1)} litros.`,

      [
        {
          text: "Cancelar",

          style: "cancel",
        },

        {
          text: "Excluir",

          style: "destructive",

          onPress: async () => {
            const novaLista = abastecimentos.filter(
              (item) => item.id !== registro.id,
            );

            setAbastecimentos(novaLista);

            await salvarDados({
              capacidade,

              quilometragemAtual,

              abastecimentos: novaLista,
            });
          },
        },
      ],
    );
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.tela}>
        <Text style={styles.carregando}>Abrindo o Chérie...</Text>
      </SafeAreaView>
    );
  }

  if (tela === "despesas") {
    return <Despesas aoVoltar={() => setTela("inicio")} />;
  }

  if (tela === "manutencoes") {
    return <Manutencoes aoVoltar={() => setTela("inicio")} />;
  }

  if (tela === "configuracoes") {
    return (
      <Configuracoes
        capacidadeInicial={capacidade}
        aoVoltar={() => setTela("inicio")}
        aoSalvar={async (novaCapacidade) => {
          setCapacidade(novaCapacidade);

          await salvarDados({
            capacidade: novaCapacidade,

            quilometragemAtual,

            abastecimentos,
          });

          setTela("inicio");

          Alert.alert("Configurações salvas", "A autonomia foi recalculada.");
        }}
      />
    );
  }

  if (tela === "abastecimento") {
    return (
      <SafeAreaView style={styles.tela}>
        <StatusBar style="light" />

        <KeyboardAvoidingView
          style={styles.preencher}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable onPress={() => setTela("inicio")}>
              <Text style={styles.voltar}>‹ Voltar</Text>
            </Pressable>

            <Text style={styles.tituloPagina}>Novo abastecimento</Text>

            <Text style={styles.descricaoPagina}>
              Registre quando mandar completar o tanque.
            </Text>

            <Campo
              titulo="Quilometragem do carro"
              valor={km}
              aoAlterar={setKm}
              exemplo="Ex.: 126500"
              sufixo="km"
            />

            <Campo
              titulo="Litros abastecidos"
              valor={litros}
              aoAlterar={setLitros}
              exemplo="Ex.: 35,4"
              sufixo="L"
            />

            <Campo
              titulo="Valor total"
              valor={valor}
              aoAlterar={setValor}
              exemplo="Ex.: 210,50"
              sufixo="R$"
            />

            <View style={styles.informacao}>
              <Text style={styles.informacaoTitulo}>Tanque completado</Text>

              <Text style={styles.informacaoTexto}>
                Esta primeira versão considera que você pediu para encher o
                tanque. Isso melhora o cálculo do consumo.
              </Text>
            </View>

            <Pressable style={styles.botao} onPress={registrarAbastecimento}>
              <Text style={styles.botaoTexto}>Salvar abastecimento</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.marca}>Chérie 🍒</Text>

            <Text style={styles.subtitulo}>Seu carro, seus cuidados.</Text>
          </View>

          <Pressable
            style={styles.botaoConfiguracoes}
            hitSlop={15}
            onPress={() => setTela("configuracoes")}
          >
            <Text style={styles.iconeConfiguracoes}>⚙️</Text>
          </Pressable>
        </View>

        <View style={styles.carro}>
          <Text style={styles.rotulo}>MEU CARRO</Text>

          <Text style={styles.nomeCarro}>Citroën C3</Text>

          <Text style={styles.detalhes}>2011 · 1.4 · Gasolina</Text>
        </View>

        <Text style={styles.tituloSecao}>Combustível estimado</Text>

        <View style={styles.grade}>
          <View style={styles.cartao}>
            <Text style={styles.icone}>⛽</Text>

            <Text style={styles.valorDestaque}>
              {estimativa ? `${estimativa.litrosRestantes.toFixed(1)} L` : "—"}
            </Text>

            <Text style={styles.legenda}>Quantidade aproximada</Text>
          </View>

          <View style={styles.cartao}>
            <Text style={styles.icone}>🛣️</Text>

            <Text style={styles.valorDestaque}>
              {estimativa
                ? `${Math.floor(estimativa.autonomiaSegura)} km`
                : "—"}
            </Text>

            <Text style={styles.legenda}>
              Autonomia com margem de segurança
            </Text>
          </View>
        </View>

        <View style={styles.alerta}>
          <Text style={styles.alertaTitulo}>
            {abastecimentos.length === 0
              ? "Comece com um tanque cheio"
              : consumoMedio
                ? `Média: ${consumoMedio.toFixed(1)} km/L`
                : "Calibrando seu consumo"}
          </Text>

          <Text style={styles.alertaTexto}>
            {abastecimentos.length === 0
              ? "Registre o próximo abastecimento completo."
              : consumoMedio
                ? "A estimativa usa seus abastecimentos anteriores."
                : "Precisamos de dois tanques completos para calcular sua média real."}
          </Text>
        </View>

        <Text style={styles.tituloSecao}>Quilometragem atual</Text>

        <View style={styles.linhaAtualizacao}>
          <TextInput
            style={styles.campoAtualizacao}
            value={quilometragemAtual}
            onChangeText={setQuilometragemAtual}
            placeholder="Ex.: 126620"
            placeholderTextColor="#78676d"
            keyboardType="decimal-pad"
          />

          <Pressable
            style={styles.botaoPequeno}
            onPress={atualizarQuilometragem}
          >
            <Text style={styles.botaoPequenoTexto}>Atualizar</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.botao}
          onPress={() => setTela("abastecimento")}
        >
          <Text style={styles.botaoTexto}>＋ Registrar tanque cheio</Text>
        </Pressable>

        <Pressable
          style={styles.botaoSecundario}
          onPress={() => setTela("manutencoes")}
        >
          <Text style={styles.botaoSecundarioTexto}>✓ Manutenções</Text>
        </Pressable>

        <Pressable
          style={styles.botaoSecundario}
          onPress={() => setTela("despesas")}
        >
          <Text style={styles.botaoSecundarioTexto}>R$ Despesas</Text>
        </Pressable>

        <Text style={styles.tituloSecao}>Histórico</Text>

        {abastecimentos.length === 0 ? (
          <Text style={styles.vazio}>Nenhum abastecimento registrado.</Text>
        ) : (
          [...abastecimentos].reverse().map((registro) => (
            <Pressable
              key={registro.id}
              style={styles.registro}
              onLongPress={() => excluirRegistro(registro)}
            >
              <View>
                <Text style={styles.registroTitulo}>
                  {registro.litros.toFixed(1)} litros
                </Text>

                <Text style={styles.registroDetalhes}>
                  {registro.km.toLocaleString("pt-BR")} km
                </Text>
              </View>

              <Text style={styles.registroValor}>
                {formatarDinheiro(registro.valor)}
              </Text>
            </Pressable>
          ))
        )}

        <Text style={styles.observacao}>
          A autonomia é uma estimativa. Mantenha uma margem de segurança e não
          espere o valor chegar a zero. Segure um registro do histórico para
          excluí-lo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Campo({ titulo, valor, aoAlterar, exemplo, sufixo }) {
  return (
    <View style={styles.grupoCampo}>
      <Text style={styles.label}>{titulo}</Text>

      <View style={styles.campoComSufixo}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={aoAlterar}
          placeholder={exemplo}
          placeholderTextColor="#78676d"
          keyboardType="decimal-pad"
        />

        <Text style={styles.sufixo}>{sufixo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preencher: {
    flex: 1,
  },

  tela: {
    flex: 1,

    backgroundColor: cores.fundo,
  },

  conteudo: {
    padding: 22,

    paddingBottom: 50,
  },

  carregando: {
    margin: "auto",

    color: cores.texto,
  },

  cabecalho: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 25,
  },

  marca: {
    color: cores.texto,

    fontFamily: "Georgia",

    fontSize: 34,
  },

  subtitulo: {
    marginTop: 4,

    color: cores.suave,

    fontSize: 13,
  },

  cerejas: {
    fontSize: 31,
  },

  carro: {
    padding: 24,

    borderWidth: 1,

    borderColor: cores.borda,

    borderRadius: 18,

    backgroundColor: cores.painelClaro,
  },

  rotulo: {
    marginBottom: 10,

    color: cores.rosa,

    fontSize: 10,

    letterSpacing: 2.5,
  },

  nomeCarro: {
    color: cores.texto,

    fontFamily: "Georgia",

    fontSize: 30,
  },

  detalhes: {
    marginTop: 8,

    color: cores.suave,

    fontSize: 13,
  },

  tituloSecao: {
    marginTop: 28,

    marginBottom: 13,

    color: cores.texto,

    fontFamily: "Georgia",

    fontSize: 21,
  },

  grade: {
    flexDirection: "row",

    gap: 12,
  },

  cartao: {
    flex: 1,

    minHeight: 145,

    padding: 17,

    borderWidth: 1,

    borderColor: "#412a33",

    borderRadius: 14,

    backgroundColor: cores.painel,
  },

  icone: {
    marginBottom: 15,

    fontSize: 23,
  },

  valorDestaque: {
    color: cores.texto,

    fontSize: 22,

    fontWeight: "600",
  },

  legenda: {
    marginTop: 7,

    color: cores.suave,

    fontSize: 11,

    lineHeight: 16,
  },

  alerta: {
    marginTop: 14,

    padding: 18,

    borderLeftWidth: 3,

    borderLeftColor: cores.cereja,

    borderRadius: 10,

    backgroundColor: "#25141a",
  },

  alertaTitulo: {
    color: cores.rosa,

    fontSize: 14,

    fontWeight: "600",
  },

  alertaTexto: {
    marginTop: 7,

    color: cores.suave,

    fontSize: 12,

    lineHeight: 19,
  },

  linhaAtualizacao: {
    flexDirection: "row",

    gap: 10,
  },

  campoAtualizacao: {
    flex: 1,

    padding: 14,

    borderWidth: 1,

    borderColor: cores.borda,

    borderRadius: 10,

    backgroundColor: cores.painel,

    color: cores.texto,
  },

  botaoPequeno: {
    justifyContent: "center",

    paddingHorizontal: 17,

    borderRadius: 10,

    backgroundColor: "#382129",
  },

  botaoPequenoTexto: {
    color: cores.rosa,

    fontSize: 12,

    fontWeight: "600",
  },

  botao: {
    alignItems: "center",

    marginTop: 20,

    padding: 16,

    borderRadius: 12,

    backgroundColor: cores.cereja,
  },

  botaoTexto: {
    color: "#fff5f7",

    fontSize: 14,

    fontWeight: "700",
  },

  registro: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 10,

    padding: 17,

    borderWidth: 1,

    borderColor: "#412a33",

    borderRadius: 12,

    backgroundColor: cores.painel,
  },

  registroTitulo: {
    color: cores.texto,

    fontSize: 14,

    fontWeight: "600",
  },

  registroDetalhes: {
    marginTop: 5,

    color: cores.suave,

    fontSize: 11,
  },

  registroValor: {
    color: cores.rosa,

    fontSize: 14,
  },

  vazio: {
    padding: 20,

    color: cores.suave,

    textAlign: "center",
  },

  observacao: {
    marginTop: 25,

    color: "#806f75",

    fontSize: 10,

    lineHeight: 16,

    textAlign: "center",
  },

  voltar: {
    marginBottom: 20,

    color: cores.rosa,

    fontSize: 15,
  },

  tituloPagina: {
    color: cores.texto,

    fontFamily: "Georgia",

    fontSize: 31,
  },

  descricaoPagina: {
    marginTop: 8,

    marginBottom: 10,

    color: cores.suave,

    fontSize: 13,

    lineHeight: 19,
  },

  grupoCampo: {
    marginTop: 20,
  },

  label: {
    marginBottom: 8,

    color: cores.suave,

    fontSize: 12,
  },

  campoComSufixo: {
    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor: cores.borda,

    borderRadius: 10,

    backgroundColor: cores.painel,
  },

  input: {
    flex: 1,

    padding: 14,

    color: cores.texto,
  },

  sufixo: {
    paddingRight: 14,

    color: cores.rosa,

    fontSize: 12,
  },

  informacao: {
    marginTop: 22,

    padding: 17,

    borderRadius: 10,

    backgroundColor: "#25141a",
  },

  informacaoTitulo: {
    color: cores.rosa,

    fontSize: 13,

    fontWeight: "600",
  },

  informacaoTexto: {
    marginTop: 7,

    color: cores.suave,

    fontSize: 11,

    lineHeight: 17,
  },

  botaoSecundario: {
    alignItems: "center",

    marginTop: 12,

    padding: 15,

    borderWidth: 1,

    borderColor: "#54303c",

    borderRadius: 12,

    backgroundColor: "#1d1519",
  },

  botaoSecundarioTexto: {
    color: "#e7a2b1",

    fontSize: 14,

    fontWeight: "600",
  },

  botaoConfiguracoes: {
    alignItems: "center",

    justifyContent: "center",

    width: 48,

    height: 48,

    borderWidth: 1,

    borderColor: "#54303c",

    borderRadius: 24,

    backgroundColor: "#1d1519",
  },

  iconeConfiguracoes: {
    fontSize: 22,
  },
});
