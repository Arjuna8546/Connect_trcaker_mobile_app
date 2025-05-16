import { TextInput } from 'react-native';

export default function InputFeildComponent({ 
  label, 
  keyboardType = "default", 
  secureTextEntry = false,
  value,
  onChangeText
}) {
  return (
    <TextInput
      placeholder={label}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChangeText}
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
