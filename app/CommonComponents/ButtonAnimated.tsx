import { StyleSheet, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import {useState} from 'react';

type ButtonAnimatedProps = {
    child: any,
    onPress: any,
    style: any,
    animatedViewStyle: any;
    isDisabled?: boolean;
}

type ButtonLabelProps = {
    label: string,
    onPress: any,
    style: any,
    animatedViewStyle: any,
    isDisabled?: boolean;
}

function getDisabledColor(hex : string | any) {
  // Check if the input is a valid hex code
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }

  // Convert the hex string to RGB values (0-255)
  const rgb = hex.slice(1).match(/.{2}/g).map((c : any) => parseInt(c, 16));

  // Reduce the contrast by lowering the luminosity
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * 0.6);
  }

  // Convert the adjusted RGB values back to hex format
  const disabledHex = `#${rgb.map((x : any) => x.toString(16).padStart(2, "0")).join("")}`;

  return disabledHex;
}


export function ButtonAnimatedWithChild({ child, onPress, style, animatedViewStyle, isDisabled} : ButtonAnimatedProps) {
    const [opacity] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }).start();
      };
    
      const handlePressOut = () => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
        onPress();
      };

      return (<Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ ...styles.UpcomingPressable, ...style }}
      disabled={isDisabled}
    >
    <Animated.View style={{ ...styles.Container, opacity, ...animatedViewStyle }}>
        {child}
    </Animated.View>
    </Pressable>)
}

export function ButtonAnimatedWithLabel({ label, onPress, style, animatedViewStyle, isDisabled} : ButtonLabelProps) {

  let styleDisabled = null;
  if (isDisabled) {
    styleDisabled = {
      backgroundColor: getDisabledColor(
        animatedViewStyle.backgroundColor || "#069A8E"
      ),
      color: getDisabledColor(animatedViewStyle.backgroundColor || "#069A8E"),
    };
  }

    return (
        <ButtonAnimatedWithChild
        child={<Text style={styles.Text}>{label}</Text>}
        onPress={onPress}
        style={style}
        animatedViewStyle={styleDisabled || animatedViewStyle}
        isDisabled={isDisabled}
        />
    )
}

const styles = StyleSheet.create({
    Container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#069A8E',
        shadowColor: 'grey',
        shadowOffset: {
          width: 2,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 5,
        width: '90%',
      },
      Text: {
        color: '#ffffff',
        fontSize: 16,
        marginLeft: 10,
      },
      UpcomingPressable: {
        width: '100%',
        alignItems: 'center',
      },
});