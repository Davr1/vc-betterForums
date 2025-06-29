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
- **Media preview** - you can now customize the count and size of media previews
  - **Improved thumbnail fetching** - thumbnails are fetched at the smallest possible size to reduce network traffic
- **Media gallery** - click on a thumbnail to open the gallery, which now correctly displays all message media
  - **Video support** - video files are now playable
  - **Message and attachment context** - contextual metadata like message timestamp, message author, file name or file size are displayed
- **Reply preview** - view the latest reply/typing indicator directly in the thread footer
  - **Jump to message** - clicking on the preview brings you to the original message
  - **Improved usernames** - usernames are now fully interactive
- **Members preview** - see the member count and member list preview in the thread footer
- **Unlimited reactions** - more reactions are visible at once, sorted in a descending order from the right. The most used reaction is always visible.
- **Follow button** - allows you to quickly follow/unfollow a thread
- **Exact counts** - message counts can either be rounded to the nearest power of 10, or display the true count

# Tag customization
Tags can be customized in two places. First is the context menu on thread tags, second is the plugin settings menu.
The following attributes can be changed:
- **Name** - any length, can't be empty
- **Color** - 9 color options based on Discord's color palettes, and one colorless option
  - **Inverted color** - switches background and foreground colors
- **Icon** - either an emoji, or an image URL (must be allowed by Vencord's CSP rules)
  - **Monochrome icon** - applies your chosen icon as a mask, can improve contrast when used along with light background colors
<p align="center">
  <img src="https://github.com/user-attachments/assets/06e5c3d4-d5b3-478c-8db5-bd56d98aee92" width="60%"/>
</p>
All overrides are saved as a diff, so properties that weren't changed (or appear the same visually) are ignored. This also means that you can change one attribute and the rest are inherited from the original tag.

# Installation

[Installation guide](https://discord.com/channels/1015060230222131221/1257038407503446176)
