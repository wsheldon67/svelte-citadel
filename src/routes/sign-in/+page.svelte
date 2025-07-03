<script lang="ts">
  import { auth } from '$lib/firebase'
  import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

  const provider = new GoogleAuthProvider()

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log('User signed in:', user)
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

</script>

<h1>Sign In</h1>
<button on:click={signInWithGoogle}>Sign in with Google</button>