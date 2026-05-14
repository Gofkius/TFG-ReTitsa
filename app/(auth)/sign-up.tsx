import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native'

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Verificación de correo electrónico
        </ThemedText>
        <ThemedText style={styles.description}>
          Un código de verificación ha sido enviado a tu correo electrónico. Por favor, introdúcelo a continuación para completar el registro.
        </ThemedText>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Introduce el código de verificación"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onVerifyPress}
        >
          <ThemedText style={styles.buttonText}>Verificar</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Solo falta crear una cuenta para ti! 🎉
      </ThemedText>
      <ThemedText style={styles.label}>Correo Electrónico</ThemedText>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Introduce tu correo electrónico"
        placeholderTextColor="#666666"
        onChangeText={(email) => setEmailAddress(email)}
        keyboardType="email-address"
      />
      <ThemedText style={styles.label}>Nombre de Usuario</ThemedText>
      <TextInput
        style={styles.input}
        value={username}
        placeholder="Introduce un nombre de usuario"
        placeholderTextColor="#666666"
        onChangeText={(username) => setUsername(username)}
      />
      <ThemedText style={styles.label}>Contraseña</ThemedText>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Introduce tu contraseña"
        placeholderTextColor="#666666"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || !username) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={onSignUpPress}
        disabled={!emailAddress || !password || !username}
      >
        <ThemedText style={styles.buttonText}>Continuar</ThemedText>
      </Pressable>
      <View style={styles.linkContainer}>
        <ThemedText>Ya tienes una cuenta? </ThemedText>
        <Link href="/sign-in">
          <ThemedText type="link">Iniciar sesión</ThemedText>
        </Link>
      </View>
      <Image 
          source={require('@/assets/images/firstLoad.png')} 
          style={styles.image}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAEFEF',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#25343F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    bottom: 0,
  }
})