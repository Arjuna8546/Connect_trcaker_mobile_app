import { TextInput } from 'react-native';
import React from 'react';

export default function InputFeildComponent({ label, keyboardType = "default", secureTextEntry = false }) {
  return (
    <TextInput
      placeholder={label}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#888"
      style={{
        color: "white",
        borderColor: "#555",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        width: '70%',
        fontSize: 16,
        backgroundColor: '#222',
      }}
    />
  );
}
