<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8">
    
    <!-- 1. Heading & Instructions -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Student Well-Being Check-In</h1>
      <p class="text-gray-700">
        Over the <strong class="underline">last 2 weeks</strong>, how often have you been bothered by any of the following problems?
      </p>
    </div>

    <!-- 2. Expandable Disclosure -->
    <details class="mb-8 border border-gray-300 rounded-md bg-gray-50 shadow-sm group">
      <summary class="font-semibold p-4 cursor-pointer list-none flex justify-between items-center text-blue-900">
        Confidentiality & Clinical Information
        <span class="text-xl group-open:rotate-45 transition-transform">+</span>
      </summary>
      <div class="p-4 pt-0 border-t border-gray-200 text-sm text-gray-700 space-y-2">
        <p>This assessment uses the Patient Health Questionnaire-9 (PHQ-9), a standard clinical instrument.</p>
        <p>Your responses are handled securely and confidentially in accordance with the school's data privacy policies. This tool is meant for screening and support routing, not as a definitive medical diagnosis.</p>
      </div>
    </details>

    <!-- 3. API Error Alert (Visible only if submission fails) -->
    <div v-if="apiError" class="mb-6 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">
      {{ apiError }}
    </div>

    <!-- 4. Main Clinical Form -->
    <form @submit.prevent="handleSubmit" class="bg-white border border-gray-400 shadow-sm">
      
      <!-- Clinical Blue Header -->
      <div class="bg-[#000066] text-white text-center py-3 font-bold text-xl tracking-wider border-b-4 border-black">
        PATIENT HEALTH QUESTIONNAIRE-9 (PHQ-9)
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="text-sm font-semibold text-gray-900 border-b-2 border-black">
              <th class="p-4 w-1/2 align-bottom italic font-normal">
                (Use "✔" to indicate your answer)
              </th>
              <th class="p-2 text-center align-bottom leading-tight">
                Not at all
              </th>
              <th class="p-2 text-center align-bottom leading-tight">
                Several<br>days
              </th>
              <th class="p-2 text-center align-bottom leading-tight">
                More<br>than half<br>the days
              </th>
              <th class="p-2 text-center align-bottom leading-tight">
                Nearly<br>every<br>day
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(question, index) in questions" 
              :key="index"
              :id="'question-' + index"
              class="border-b border-gray-400 hover:bg-gray-50 transition-colors"
              :class="{'bg-red-50': errors[index]}"
            >
              <td class="p-4 align-top">
                <span class="font-bold mr-2">{{ index + 1 }}.</span>
                <span class="text-gray-900">{{ question }}</span>
                <!-- Inline Validation Error -->
                <p v-if="errors[index]" class="text-red-600 text-sm mt-1 font-semibold animate-pulse">
                  * This item is mandatory. Please select a response.
                </p>
              </td>
              <!-- Radio Buttons for Responses (0 to 3) with exact numbers from the form -->
              <td v-for="value in [0, 1, 2, 3]" :key="value" class="p-2 text-center align-middle">
                <label class="flex flex-col items-center cursor-pointer">
                  <span class="text-gray-600 text-sm mb-1">{{ value }}</span>
                  <input 
                    type="radio" 
                    :name="'phq9-q' + index" 
                    :value="value"
                    v-model="responses[index]"
                    @change="errors[index] = false"
                    class="w-5 h-5 text-[#000066] focus:ring-blue-500 cursor-pointer"
                  >
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Action Buttons -->
      <div class="p-6 bg-gray-50 flex gap-4 justify-end border-t border-gray-400">
        <button 
          type="button" 
          @click="showCancelModal = true"
          class="px-6 py-2 border border-gray-400 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition-colors"
          :disabled="isLoading"
        >
          Cancel
        </button>
        
        <button 
          type="submit" 
          class="px-8 py-2 bg-[#000066] text-white font-semibold rounded-md hover:bg-blue-900 transition-colors flex items-center justify-center min-w-[140px]"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isLoading ? 'Submitting...' : 'Submit Assessment' }}
        </button>
      </div>
    </form>

    <!-- 5. Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">Discard Assessment?</h3>
        <p class="text-gray-600 mb-6">Are you sure you want to cancel? Any unsaved progress will be permanently discarded.</p>
        <div class="flex justify-end gap-3">
          <button @click="showCancelModal = false" class="px-4 py-2 border rounded-md hover:bg-gray-100">Keep Working</button>
          <button @click="navigateAway" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Discard & Leave</button>
        </div>
      </div>
    </div>

    <!-- 6. Crisis Support Modal (Triggered on Q9 non-zero) -->
    <div v-if="showCrisisModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full border-t-8 border-red-600 p-6">
        <h3 class="text-2xl font-bold text-red-700 mb-4">Immediate Support Available</h3>
        <p class="text-gray-800 font-medium mb-4">Based on your responses, we want to ensure you have immediate access to support.</p>
        
        <div class="bg-red-50 p-4 rounded-md border border-red-200 mb-6 space-y-3">
          <p class="font-bold">National Mental Health Crisis Hotline:</p>
          <ul class="list-disc pl-5 text-red-800 font-semibold space-y-1">
            <li>1553 (Luzon-wide landline toll-free)</li>
            <li>0917-899-USAP (8727)</li>
            <li>0966-351-4518</li>
          </ul>
          <p class="text-sm text-gray-600 mt-2">Available 24/7. Your guidance counselor will also be notified to reach out to you.</p>
        </div>

        <button @click="proceedToResults" class="w-full py-3 bg-gray-900 text-white font-bold rounded-md hover:bg-black">
          I Understand, Continue to Results
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
]

// State variables
const responses = ref(Array(9).fill(null))
const errors = ref(Array(9).fill(false))
const isLoading = ref(false)
const apiError = ref('')
const showCancelModal = ref(false)
const showCrisisModal = ref(false)

const handleSubmit = async () => {
  apiError.value = ''
  errors.value = Array(9).fill(false)
  let isValid = true
  let firstErrorIndex = -1

  // Submit-time validation checks for all 9 items
  responses.value.forEach((val, index) => {
    if (val === null) {
      errors.value[index] = true
      isValid = false
      if (firstErrorIndex === -1) firstErrorIndex = index
    }
  })

  // Prevent submission & scroll to the first unanswered item
  if (!isValid) {
    const errorElement = document.getElementById(`question-${firstErrorIndex}`)
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return 
  }

  isLoading.value = true
  try {
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500)) 
    
    // Crisis Protocol Check: Question 9 is index 8
    if (responses.value[8] !== null && responses.value[8] > 0) {
      isLoading.value = false
      showCrisisModal.value = true
      return // Halt routing until they acknowledge the modal
    }

    proceedToResults()
  } catch (error) {
    apiError.value = "An error occurred while submitting your assessment. Please try again."
  } finally {
    isLoading.value = false
  }
}

const proceedToResults = () => {
  const totalScore = responses.value.reduce((sum, val) => (sum || 0) + (val || 0), 0)
  navigateTo(`/assessment/results?score=${totalScore}`)
}

const navigateAway = () => {
  navigateTo('/')
}
</script>