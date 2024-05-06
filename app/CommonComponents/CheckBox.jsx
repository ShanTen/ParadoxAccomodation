import { Pressable, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckBox({
  checked,
  onChange,
  buttonStyle = {},
  activeButtonStyle = {},
  inactiveButtonStyle = {},
  activeIconProps = {},
  inactiveIconProps = {},
}) {
  const iconProps = checked ? activeIconProps : inactiveIconProps;
  return (
    <Pressable
      style={[
        buttonStyle,
        checked
          ? activeButtonStyle
          : inactiveButtonStyle,
      ]}
      // onPress returns the current state of the checkbox as parameter
      onPress={() => onChange(!checked)}> 
      {checked && (
        <Ionicons
          name="checkmark"
          size={24}
          color="white"
          {...iconProps}
        />
      )}
    </Pressable>
  );
}