module.exports = {
  onPreBuild: async ({ utils: { build, run } }) => {
    try {
      console.log('Installing pnpm using npm');
      await run.command('npm i -g pnpm');
      const { stdout: pnpmVersion } = await run.command('pnpm --version');
      console.log(`Installing Node modules using pnpm version ${pnpmVersion}`);
      await run.command('pnpm i --frozen-lockfile=true');
      console.log('Node modules installed');
    }
    catch (error) {
      return build.failBuild(error);
    }
  },
};
