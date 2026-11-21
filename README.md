# Chérie 🍒

Aplicativo mobile para acompanhar combustível, autonomia estimada, despesas e manutenções do carro.

O projeto nasceu para ajudar quando o marcador de combustível não é confiável. A estimativa usa os abastecimentos com tanque cheio, a quilometragem percorrida e o consumo médio calculado pelo aplicativo.

## Funcionalidades

- Registro de abastecimentos com tanque cheio.
- Histórico de litros, valor e quilometragem.
- Cálculo do consumo médio em km/L.
- Estimativa de combustível restante.
- Autonomia com margem de segurança de 15%.
- Atualização da quilometragem atual.
- Capacidade do tanque configurável.
- Registro de manutenções.
- Controle da próxima revisão por quilometragem.
- Controle de despesas por categoria.
- Inclusão automática do abastecimento nas despesas.
- Persistência local dos dados no celular.

## Categorias de despesas

- Combustível
- Manutenção
- Seguro
- Parcela
- Acessórios
- Outros

## Como a estimativa funciona

Após dois abastecimentos consecutivos com tanque cheio, o consumo é calculado assim:

```text
consumo médio = distância percorrida ÷ litros abastecidos
```

A autonomia considera:

```text
autonomia = combustível estimado × consumo médio
```

O aplicativo desconta uma reserva de segurança antes de exibir a autonomia disponível.

Os resultados são estimativas e não substituem o marcador, a inspeção do veículo ou o abastecimento preventivo.

## Tecnologias

- React Native
- Expo
- JavaScript
- AsyncStorage

## Executar o projeto

### Pré-requisitos

- Node.js
- npm
- Expo Go instalado no celular
- Conta Expo conectada no computador e no aplicativo

### Instalação

```bash
git clone https://github.com/mariaeduardaguerra/cherie.git
cd cherie
npm install
```

### Iniciar

```bash
npx expo login
npx expo start
```

Leia o QR code com o celular e abra o projeto no Expo Go.

## Armazenamento

Os dados ficam armazenados localmente com AsyncStorage.

Nesta versão:

- não há sincronização entre dispositivos;
- não há conta de usuário;
- apagar os dados do Expo Go pode remover os registros;
- recomenda-se manter também os comprovantes e registros importantes.

## Estrutura

```text
cherie
├── App.js
└── src
    ├── components
    ├── screens
    │   ├── Configuracoes.js
    │   ├── Despesas.js
    │   └── Manutencoes.js
    └── storage
        └── dados.js
```

## Veículo usado durante o desenvolvimento

- Citroën C3
- Ano 2011
- Motor 1.4
- Combustível flex, utilizado com gasolina
- Capacidade aproximada do tanque: 47 litros

A capacidade pode ser alterada nas configurações.

## autora   

Desenvolvido por [Maria Eduarda Guerra](https://github.com/mariaeduardaguerra)