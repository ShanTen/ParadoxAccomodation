import { StyleSheet, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import {useState} from 'react';

type ButtonAnimatedProps = {
    child: any,
    onPress: any,
    style: any,
    animatedViewStyle: any;
}

type ButtonLabelProps = {
    label: string,
    onPress: any,
    style: any,
    animatedViewStyle: any;
}

export function ButtonAnimatedWithChild({ child, onPress, style, animatedViewStyle} : ButtonAnimatedProps) {
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
    >
    <Animated.View style={{ ...styles.Container, opacity, ...animatedViewStyle }}>
        {child}
    </Animated.View>
    </Pressable>)
}

export function ButtonAnimatedWithLabel({ label, onPress, style, animatedViewStyle} : ButtonLabelProps) {
    return (
        <ButtonAnimatedWithChild
        child={<Text style={styles.Text}>{label}</Text>}
        onPress={onPress}
        style={style}
        animatedViewStyle={animatedViewStyle}
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