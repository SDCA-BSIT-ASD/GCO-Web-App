<template>
  <h2>Add New Academic Term</h2>
  <form @submit.prevent="submitAcademicTerm">
    <label for="txt-title">Title</label><br/>
    <input class="input" type="text" id="txt-title" name="title" required><br/>
    <label for="date-start">Start Date</label><br/>
    <input class="input" type="date" id="date-start" name="startDate" required><br/>
    <label for="date-end">End Date</label><br/>
    <input class="input" type="date" id="date-end" name="endDate" required><br/>
    <button class="btn btn-success" type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
  async function submitAcademicTerm(event: SubmitEvent) {
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const academicTerm = await $fetch('/api/academic-terms', {
        method: 'POST',
        body: {
          title: formData.get('title'),
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate')
        }
      })

      console.log('Academic term created:', academicTerm)
    } catch (error) {
      console.error('Failed to create academic term:', error)
    }
  }
</script>