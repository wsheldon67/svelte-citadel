<script lang="ts">
  import { auth } from "$lib/firebase"
  import { signInAnonymously } from "firebase/auth"
  
  if (!auth.currentUser) {
    signInAnonymously(auth)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user
        console.log("User signed in anonymously:", user)
      })
      .catch((error) => {
        console.error("Error signing in anonymously:", error)
      })
  }
</script>