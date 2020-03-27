<template>
  <div>/{{ param }}/index</div>
</template>

<script>
export default {
  asyncData({ params }) {
    return params
  },
}
</script>
