# BetterForums
![Preview](https://gist.github.com/Davr1/97750831d8260764477c089ecb3879b9/raw/Preview.png)

# Installation

In order to use custom plugins within Vencord, you must compile the source code yourself. For this you will need git and nodejs installed.

1. Clone the repository

```bash
git clone https://github.com/Vendicated/Vencord/
```

2. Install dependencies

```bash
npm i -g pnpm
cd Vencord
pnpm i
```

3. Clone this repository

```bash
mkdir src\userplugins
git clone https://github.com/Davr1/vc-betterForums src\userplugins\vc-betterForums
```

4. Compile Vencord

```bash
pnpm run build
```

5. Inject Vencord

```bash
pnpm run inject
```
