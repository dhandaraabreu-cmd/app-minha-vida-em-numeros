import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Grafico({ registros }) {
  if (registros.length < 2) {
    return (
      <Text style={{ textAlign: 'center', margin: 10 }}>
        Adicione pelo menos 2 registros para ver o gráfico.
      </Text>
    );
  }

  const labels = registros
    .map(reg => new Date(reg.id).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    .reverse();

  const dadosAgua = registros.map(reg => reg.agua).reverse();
  const dadosExercicio = registros.map(reg => reg.exercicio).reverse();
  const dadosCalorias = registros.map(reg => reg.calorias).reverse();

  const windowWidth = Dimensions.get('window').width;

  const data = {
    labels,
    datasets: [
      {
        data: dadosAgua,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: dadosExercicio,
        color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: dadosCalorias,
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Água (copos)', 'Exercício (min)', 'Calorias (kcal)'],
  };

  const chartConfig = {
    backgroundColor: '#e0f7fa',
    backgroundGradientFrom: '#e0f7fa',
    backgroundGradientTo: '#b2ebf2',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 8 },
    propsForDots: { r: '4', strokeWidth: '1', stroke: '#333' },
  };

  return (
    <View>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, marginTop: 5 }}>
        Evolução dos Registros
      </Text>
      <LineChart
        data={data}
        width={windowWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 8, borderRadius: 8, marginHorizontal: 16 }}
      />
    </View>
  );
}
