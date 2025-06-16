# BetterForums
This plugin completely replaces the forum list item component and introduces new quality-of-life features and bug fixes.
<p align="center">
<img src="https://github.com/user-attachments/assets/49806a92-b07e-4115-abb3-9640398c727f" width="80%"/>
</p>

# Features
- **Persistent state** - forum options (sort, filter, tag matching, etc) no longer get reverted after restart.
- **Tags**:
  - **Custom tags** - new implicit tags based on current thread state (New, Pinned, Archived, Locked, Abandoned)
  - **Tag overrides** - allows full customization of *custom* and *forum* tags - change the name, color, or icon
  - **Quick filter** - click on a tag to add it to the filters - click again to disable
- **Message preview** - message preview can show as many lines as you want - two, three, or more
- **Reply preview** - view the latest reply/typing indicator directly in the thread footer
  - **Jump to message** - clicking on the preview brings you to the original message
  - **Improved usernames** - usernames are now fully interactive
- **Members preview** - see the member count and member list preview in the thread footer
- **Unlimited reactions** - more reactions are visible at once, sorted in a descending order from the right. The most used reaction is always visible.
- **Follow button** - allows you to quickly follow/unfollow a thread
- **Exact counts** - message counts can either be rounded to the nearest power of 10, or display the true count

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
