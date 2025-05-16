import { TouchableOpacity, View, Text } from 'react-native';
import React from 'react';

export default function RoundButtonComp({ name, border, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: '70%', alignSelf: 'center' }}>
      <View style={{
        backgroundColor: border ? "#4B9EF7" : "#fff",
        paddingVertical: 14,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
      }}>
        <Text style={{ color: border ? 'white' : "black", textAlign: 'center', fontWeight: '600', fontSize: 16 }}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
}
