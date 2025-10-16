import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';

import * as Database from './services/Database';
import Formulario from './components/Formulario';
import ListaRegistros from './components/ListaRegistros';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const dados = await Database.carregarDados();
      setRegistros(dados);
      setCarregando(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!carregando) {
      Database.salvarDados(registros);
    }
  }, [registros, carregando]);

  const handleSave = (coposAgua, minutosExercicio, calorias) => {
    const aguaNum = parseFloat(String(coposAgua).replace(',', '.'));
    const exercicioNum = parseFloat(String(minutosExercicio).replace(',', '.'));
    const caloriasNum = parseFloat(String(calorias).replace(',', '.'));

    if (aguaNum < 0 || exercicioNum < 0 || caloriasNum < 0) {
      return Alert.alert("Erro de Validação", "Nenhum valor pode ser negativo. Por favor, corrija.");
    }

    if (editingId) {
      const registrosAtualizados = registros.map(reg =>
        reg.id === editingId
          ? {
              ...reg,
              agua: aguaNum,
              exercicio: exercicioNum,
              calorias: caloriasNum,
              data: new Date().toLocaleDateString('pt-BR')
            }
          : reg
      );
      setRegistros(registrosAtualizados);
    } else {
      const novoRegistro = {
        id: new Date().getTime(),
        data: new Date().toLocaleDateString('pt-BR'),
        agua: aguaNum,
        exercicio: exercicioNum,
        calorias: caloriasNum
      };
      setRegistros([...registros, novoRegistro]);
    }

    setEditingId(null);
    Alert.alert('Sucesso!', 'Seu registro foi salvo!');
  };

  const handleDelete = (id) => {
    setRegistros(registros.filter(reg => reg.id !== id));
    Alert.alert('Sucesso!', 'O registro foi deletado.');
  };

  const handleEdit = (registro) => {
    setEditingId(registro.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const exportarDados = async () => {
    const fileUri = Database.fileUri;
    if (Platform.OS === 'web') {
      const jsonString = JSON.stringify(registros, null, 2);
      if (registros.length === 0) {
        return Alert.alert("Aviso", "Nenhum dado para exportar.");
      }
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dados.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return Alert.alert("Aviso", "Nenhum dado para exportar.");
      }
      if (!(await Sharing.isAvailableAsync())) {
        return Alert.alert("Erro", "Compartilhamento não disponível.");
      }
      await Sharing.shareAsync(fileUri);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>Meu Diário Fit 💪</Text>
        <Text style={styles.subtituloApp}>Seu progresso diário de saúde</Text>

        <Formulario 
          onSave={handleSave} 
          onCancel={handleCancel}
          registroEmEdicao={registros.find(r => r.id === editingId) || null}
        />

        <ListaRegistros 
          registros={registros}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <View style={styles.card}>
          <Text style={styles.subtitulo}>Exportar "Banco de Dados"</Text>
          <TouchableOpacity style={styles.botaoExportar} onPress={exportarDados}>
            <Text style={styles.botaoTexto}>Exportar arquivo dados.json</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? 25 : 0, backgroundColor: '#e0f7fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#00796b' },
  subtituloApp: { textAlign: 'center', fontSize: 16, color: '#555', marginTop: -15, marginBottom: 20, fontStyle: 'italic' },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginHorizontal: 15, marginBottom: 20, elevation: 3 },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#004d40' },
  botaoExportar: { backgroundColor: '#00796b', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 5 },
  botaoTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

