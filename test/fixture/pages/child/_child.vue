<template>
  <div>/child/{{ child }}</div>
</template>

<script>
export default {
  asyncData({ params }) {
    return params
  },
}
</script>
