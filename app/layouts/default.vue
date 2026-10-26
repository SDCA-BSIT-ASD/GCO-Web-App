<template>
  <div class="drawer">
    <input id="app-drawer" type="checkbox" class="drawer-toggle"/>
    <div class="drawer-content flex min-h-screen flex-col">
      <AppNavbar/>
      <main class="flex-1">
        <slot/>
      </main>
    </div>
    <AppSidebar/>
  </div>
</template>
