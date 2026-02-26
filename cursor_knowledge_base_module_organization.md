# Knowledge base module organization
_Exported on 1/19/2026 at 18:18:03 CST from Cursor (2.3.41)_

---

**User**

organize Z:\code\devcntr-app\dev-center\docs\modules\knowledge-base . show plan first

---

**Cursor**

I've analyzed the current structure of the `knowledge-base` module and found several inconsistencies in file naming, directory organization, and navigation.

Here is the proposed plan to organize `Z:\code\devcntr-app\dev-center\docs\modules\knowledge-base`:

### 1. File Renaming & Standardization
Standardize all files to use **kebab-case** and ensure main section files are named `index.adoc` for consistency with the `development-tools` pattern.

*   `pages/ssh-keys/SSH Keys.adoc` → `pages/ssh-keys/ssh-keys.adoc` (fix casing and spaces)
*   `pages/nodejs/nodejs.adoc` → `pages/nodejs/index.adoc`
*   `pages/flutter/dartSDK-setup.adoc` → `pages/flutter/dart-sdk-setup.adoc`
*   `pages/asciidoc/asciidoc-tools.adoc` → `pages/asciidoc/index.adoc`
*   `pages/file-sync/sync.adoc` → `pages/file-sync/index.adoc`

### 2. Relocate Non-Renderable Files
Antora expects rendered pages in `pages/`. Scripts and raw text reports should be moved to `examples/` or `attachments/`.

*   **Attachments**: Move `pages/git/git-ssh-ux-bug-report.txt` → `attachments/git/git-ssh-ux-bug-report.txt`.
*   **Examples**: Move `pages/ssh-keys/ssh-agent-setup/setup-linux.sh` and `setup-windows.ps1` → `examples/ssh-keys/`.
*   Clean up the now-empty `pages/ssh-keys/ssh-agent-setup/` directory.

### 3. Update Navigation (`nav.adoc`)
Update the navigation file to reflect new names and improve grouping:

*   Add missing pages: `sync-by-gemini.adoc` and `sync-grok4.adoc` under File Sync.
*   Fix broken link to `ssh-keys.adoc`.
*   Ensure all links point to the renamed `index.adoc` files where applicable.

### 4. Audit Internal Links
*   Update `pages/index.adoc` (the module landing page) to use the new standardized paths.
*   Search and replace any cross-references (`xref:`) within the `.adoc` files that point to the old filenames.

**Would you like me to proceed with this plan?**

---

**User**

yes

---

**Cursor**

```asciidoc
* xref:index.adoc[Knowledge Base]
* xref:development-tools/index.adoc[Development Tools]
** xref:development-tools/tailwind-setup.adoc[Tailwind Setup]
* xref:asciidoc/index.adoc[AsciiDoc Tools]
* xref:git/git-repo-management.adoc[Git Repository Management]
** xref:git/git-ignore-local.adoc[.gitignore.local]
** xref:git/git-branching-strategies.adoc[Branching Strategies]
** xref:git/git-hooks.adoc[Git Hooks]
** xref:git/git-large-files.adoc[Large Files & LFS]
** xref:git/git-submodules.adoc[Submodules & Monorepos]
** xref:git/git-recovery.adoc[Recovery & Troubleshooting]
* xref:nodejs/index.adoc[Node.js]
** xref:nodejs/pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving]
* xref:ssh-keys/ssh-keys.adoc[SSH Keys]
* xref:flutter/dart-sdk-setup.adoc[Flutter: Dart SDK Setup]
* xref:file-sync/index.adoc[File Sync]
** xref:file-sync/sync-by-gemini.adoc[Sync by Gemini]
** xref:file-sync/sync-grok4.adoc[Sync Grok4]

```

```asciidoc
* xref:index.adoc[Knowledge Base]
* xref:development-tools/index.adoc[Development Tools]
** xref:development-tools/tailwind-setup.adoc[Tailwind Setup]
* xref:asciidoc/index.adoc[AsciiDoc Tools]
* xref:git/index.adoc[Git Repository Management]
** xref:git/git-ignore-local.adoc[.gitignore.local]
** xref:git/git-branching-strategies.adoc[Branching Strategies]
** xref:git/git-hooks.adoc[Git Hooks]
** xref:git/git-large-files.adoc[Large Files & LFS]
** xref:git/git-submodules.adoc[Submodules & Monorepos]
** xref:git/git-recovery.adoc[Recovery & Troubleshooting]
* xref:nodejs/index.adoc[Node.js]
** xref:nodejs/pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving]
* xref:ssh-keys/ssh-keys.adoc[SSH Keys]
* xref:flutter/dart-sdk-setup.adoc[Flutter: Dart SDK Setup]
* xref:file-sync/index.adoc[File Sync]
** xref:file-sync/sync-by-gemini.adoc[Sync by Gemini]
** xref:file-sync/sync-grok4.adoc[Sync Grok4]

```

```asciidoc
= Knowledge Base

This knowledge base contains best practices and technical knowledge that will be enforced and presented in the Dev Center application.

include::ROOT:partial$tooling-knowledge-gap.adoc[]

== Topics

* xref:development-tools/index.adoc[Development Tools] - Recommended development tools
* xref:asciidoc/index.adoc[AsciiDoc Tools] - AsciiDoc tooling
* xref:git/index.adoc[Git] - Git best practices and workflows
* xref:nodejs/index.adoc[Node.js] - Node.js ecosystem knowledge
* xref:ssh-keys/ssh-keys.adoc[SSH Keys] - SSH key management
* xref:flutter/dart-sdk-setup.adoc[Flutter] - Flutter development setup
* xref:file-sync/index.adoc[File Sync] - File synchronization strategies

```

```asciidoc
= SSH Keys Explanation

SSH keys are a highly secure replacement for the use of passwords when communicating with a remote machine or service. In order to use them, you need to generate a key pair using a command line tool, such as `ssh-keygen`,and configure your local machine to use the private key, then copy the public key into the SSH settings of the service, such as GitHub, GitLab, or Bitbucket. When generating the keys, you can password-protect the private key to further enhance security, preventing unauthorized access even if the private key is compromised.

== What are SSH Keys useful for?

They are particularly useful for:

*Git Operations*::
Securely push, pull, and clone repositories from Git hosting services (GitHub, GitLab, Bitbucket) without entering credentials repeatedly
*Server Access*::
Connect to remote servers, VPS instances, and cloud computing resources securely
*Automated Processes*::
Enable scripts and automated build pipelines (CI/CD pipelines) to access repositories and servers without manual intervention

*Key Benefits (no pun intended)*::
*Enhanced Security*::
Much more secure than passwords as they use public-key cryptography
*Convenience*::
Single key can be registered across multiple services
*Revocable*::
Keys can be easily revoked if compromised
*Audit Trail*::
Better tracking of who accessed what and when

== Generating SSH Keys

Before you can use SSH keys, you need to generate a pair: a private key (which you keep secret) and a public key (which you share with services like GitHub or remote servers). The `ssh-keygen` utility is used for this purpose.

=== Choosing a Key Type

It's recommended to use modern, secure algorithms.
*   `ed25519`:: This is currently the recommended algorithm for most use cases due to its strong security properties and smaller key sizes.
*   `rsa`:: While still widely used, if you need RSA, it's best to generate keys with at least 4096 bits for enhanced security.

=== Generating a New Key Pair

To generate an SSH key pair, open your terminal (Git Bash on Windows) and run the `ssh-keygen` command.

==== Recommended: ed25519 Key

This command generates an `ed25519` key with a comment that helps identify it:

[source,sh]
----
ssh-keygen -t ed25519 -C "your_email@example.com"
----

You'll be prompted to:
1.  **Enter a file in which to save the key:** The default location is `~/.ssh/id_ed25519`. You can press Enter to accept this, or specify a custom path (e.g., `~/.ssh/id_ed25519_github` if you plan to use multiple keys).
2.  **Enter passphrase (empty for no passphrase):** It's highly recommended to use a strong passphrase to protect your private key. This passphrase will be requested when you add the key to `ssh-agent`.
3.  **Enter same passphrase again:** Confirm your passphrase.

After generation, two files will be created in your chosen directory (e.g., `~/.ssh/`):
*   `id_ed25519` (or your custom filename): Your **private key**. Keep this file secret and secure.
*   `id_ed25519.pub` (or your custom filename with `.pub`): Your **public key**. This is the content you'll share with remote services.

==== Alternative: RSA Key (4096 bits)

If you require an RSA key (e.g., for compatibility with older systems), use a minimum of 4096 bits:

[source,sh]
----
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
----

The prompts and resulting files will be similar to the `ed25519` generation, but the default filenames will be `id_rsa` and `id_rsa.pub`.

=== Viewing Your Public Key

Once generated, you can view your public key content to copy it for services like GitHub or GitLab:

[source,sh]
----
cat ~/.ssh/id_ed25519.pub
# Or for a custom key:
cat ~/.ssh/my_custom_key.pub
----

Copy the entire output, starting with `ssh-ed25519` or `ssh-rsa` and ending with your comment, and paste it into the appropriate field on the remote service.

== Do I need more than one SSH key?

It depends. You don't need separate keys for each service from your personal computers. You only need separate keys when separating personal from work identities or when connecting CI/CD pipelines to services. For committing code, you can reuse the same key across multiple repository providers.

Single key approach (simpler):
* One SSH key for all services (GitHub, GitLab, VideoLAN GitLab, etc.)
* Upload the same public key to each service
* Less to manage, works perfectly fine

Multiple keys only make sense if:
* You're separating work/personal identities
* You need different keys for security/compliance requirements
* A key gets compromised and you want to limit blast radius
* You're managing many identities and want organizational clarity

For personal use across multiple services: One key is simpler and sufficient. The services don\'t care if you reuse the same key — they just verify you own the private key that matches the public key you uploaded.

=== SSH Client Configuration (~/.ssh/config)

While `ssh-agent` manages your private keys, the `ssh` *client* program uses the `~/.ssh/config` file to determine *how* it connects to remote servers and *which* keys to use. This file allows you to customize connection settings on a per-host basis or globally, simplifying your SSH commands and automating complex connection setups.

The `~/.ssh/config` file is read by the `ssh` client every time you attempt a connection. It is crucial for specifying non-default settings, including which private key to offer for a particular host.

==== Common Directives

Here are some of the most frequently used directives in `~/.ssh/config`:

*   `Host <alias>`::
    Defines a logical name (alias) for a remote host. All following directives until the next `Host` or end of file apply to this alias. Wildcards (`*` and `?`) can be used to match multiple hosts.
*   `Hostname <real_hostname>`::
    Specifies the actual hostname or IP address of the remote server.
*   `User <username>`::
    Sets the username to use when connecting to the remote host.
*   `Port <port_number>`::
    Defines the port number for the SSH connection (default is 22).
*   `IdentityFile <path_to_private_key>`::
    Specifies the path to the private key file that the `ssh` client should offer to `ssh-agent` for authentication for this host. This is how you tell `ssh` to use a specific key for a specific service (e.g., a different key for GitHub vs. GitLab).
*   `IdentitiesOnly yes`::
    When set to `yes`, `ssh` will only use the keys specified by `IdentityFile` directives (or the default keys if none are specified) and will not try other keys loaded in `ssh-agent`. This can speed up authentication and prevent accidentally offering the wrong key.
*   `AddKeysToAgent yes`::
    Automatically adds the private key specified by `IdentityFile` to `ssh-agent` if it\'s not already loaded. Requires `ssh-agent` to be running. Note: This automatically adds the key but still prompts for the passphrase if the key is encrypted.
*   `ForwardAgent yes`::
    Enables `ssh-agent` forwarding. This allows your local `ssh-agent` to handle authentication for connections made *from* the remote server you\'ve connected to. Useful for bastion hosts or chaining SSH connections.
*   `ProxyJump <user@jumphost>`::
    Allows you to connect to a target host by first connecting to a jump host (bastion host) and then establishing a second SSH connection through it.

==== Example ~/.ssh/config

Here\'s an example `~/.ssh/config` file demonstrating several common scenarios:\n\n[source,config]
----\n# Global settings for all hosts unless overridden
Host *
  AddKeysToAgent yes
  IdentitiesOnly yes
  ServerAliveInterval 60
  ServerAliveCountMax 5

# Configuration for GitHub
Host github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github

# Configuration for a specific personal server
Host myserver
  Hostname 192.168.1.100
  User myuser
  Port 2222
  IdentityFile ~/.ssh/id_rsa_personal

# Configuration for a work project that uses a bastion host
Host work-project
  Hostname 10.0.0.50
  User deployuser
  IdentityFile ~/.ssh/id_ed25519_work
  ProxyJump admin@bastion.work.com

# Configuration for a generic bastion host
Host bastion.work.com
  User admin
  IdentityFile ~/.ssh/id_rsa_bastion
----\n\nWith this setup, you can simply run `ssh github.com`, `ssh myserver`, or `ssh work-project`, and the `ssh` client will automatically apply the defined settings, including using the correct private key from `ssh-agent`.

== SSH Agent

ssh-agent is a tool that manages SSH keys for you. It stores your private keys securely and automatically uses them when you connect to a server. This means you don't have to enter your passphrase every time you connect.

ssh-agent is preinstalled on macOS and most Linux distributions. On Windows, it requires installation as part of the OpenSSH Client feature.

=== SSH Agent GUI recommendation

I recommend checking out https://github.com/frequency403/OpenSSH-GUI for a graphical user interface to manage your OpenSSH keys.

=== Alternative SSH Agents

There are alternative SSH agents available, such as Pageant for Windows and Keychain for macOS. Many popular password managers (1Password, Bitwarden) also provide their own SSH agents that can replace ssh-agent. The choice is yours.

=== Installing SSH Agent

==== Linux and macOS

ssh-agent is preinstalled and available out of the box. No installation is needed.

If missing (rare), install the `openssh-client` package:

- On Ubuntu/Debian: `sudo apt install openssh-client`
- On Fedora: `sudo dnf install openssh-clients`
- On macOS: Already included; use Homebrew if needed: `brew install openssh`

==== Windows

On Windows 10 version 1803 and later:

1. Go to `Settings > Apps > Optional features`.
2. Click `Add a feature`, search for "OpenSSH Client", and install it.

Alternatively, via PowerShell (as Administrator):

[source,powershell]
----
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
----

If using Windows Subsystem for Linux (WSL), the Linux distros that run inside of WSL do not have access to the Windows ssh-agent that you installed. You will have to either create a bridge or relay to access windows ssh-agent from inside of WSL or install an internal copy by following the Linux instructions.

Git for Windows (Git Bash) also includes its own ssh-agent. Git Bash is based on MSYS2, a minimal GNU system environment for Windows (GNU is the OS toolset for most Linux distributions, while Linux itself is a kernel which runs those tools).

Once installed, you can start the agent manually using the instructions below.

=== Starting SSH Agent Manually

==== Linux and macOS

Start the agent with:

[source,sh]
----
ssh-agent $SHELL
----

in a new shell session.

Alternatively, in the existing shell session, use:

[source,sh]
----
eval "$(ssh-agent -s)"
----

This starts the agent and sets environment variables for the current shell session.

==== Windows

Assuming OpenSSH Client is installed, open PowerShell as Administrator and run:

[source,powershell]
----
Start-Service ssh-agent
----

For the current session in PowerShell (non-admin), start the agent and set environment variables:

[source,powershell]
----
& ssh-agent -s | Invoke-Expression
----

For Git Bash or compatible shells, use `eval "$(ssh-agent -s)"`.

You can verify if the SSH agent is running and check for loaded keys using the methods below.

=== Checking if SSH Agent is Running

You can check if the SSH agent is running and list loaded keys with:

[source,sh]
----
ssh-add -l
----

If no identities are loaded or the agent isn't running, this will output an error like "The agent has no identities" or "Could not open a connection to your authentication agent."

Alternatively, check for the process:

- On Linux/macOS: `pgrep ssh-agent`
- On Windows (PowerShell): `Get-Process ssh-agent -ErrorAction SilentlyContinue`

Once the agent is running, you can add your private keys to it so SSH can use them for authentication.

=== Adding Keys to SSH Agent

To add your private key to the agent, run the following command (replace `~/.ssh/id_rsa` with the path to your private key if different):

[source,sh]
----
ssh-add ~/.ssh/id_rsa
----

It's important to note that `ssh-agent` does not automatically discover keys in `~/.ssh` or from your `~/.ssh/config` file. This is a security feature, requiring explicit action to load keys into the agent's memory, ensuring you control which sensitive keys are available for use.

You can add multiple keys by running the command for each one, for example `ssh-add ~/.ssh/id_ed25519`. You'll be prompted for the passphrase of each key added.

While `ssh-add` does not directly support wildcard patterns (e.g., `ssh-add ~/.ssh/*`), you can use your shell's capabilities (like Bash or Zsh) to expand wildcards into a list of specific files.

For example, to add all private keys in your `~/.ssh` directory that follow common naming conventions (e.g., `id_*` or ending with `.pem`):

[source,sh]
----
for KEY in ~/.ssh/id_* ~/.ssh/*.pem; do
  if [ -f "$KEY" ]; then
    ssh-add "$KEY"
  fi
done
----

This loop iterates through files matching the patterns and adds each existing file to the agent.

=== Automatic Startup

Instead of starting the agent manually each session, you can configure ssh-agent to start automatically on login. This ensures the agent runs persistently without manual intervention each time. You can also set up your shell profile (e.g., `~/.bashrc` or `~/.profile`) to automatically add keys after the agent starts, though you'll still need to enter the passphrase initially unless using additional tools like keychain (on Linux/macOS) or storing passphrases securely.

For easy automated installation and configuration, run the provided setup scripts:

* Linux: xref:attachment$ssh-keys/setup-linux.sh[setup-linux.sh]
* Windows: xref:attachment$ssh-keys/setup-windows.ps1[setup-windows.ps1]

These scripts install dependencies if needed and configure automatic startup with key management. Note: No script for macOS, as it often starts automatically; use the manual instructions below if needed.

To configure manually per OS, follow the instructions below:

==== Linux

The simplest way is to add the start command to your shell profile for user sessions.

1. Edit `~/.bashrc` or `~/.profile` (depending on your shell; bash uses `.bashrc`):

[source,sh]
----
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_rsa  # Add your key(s); passphrase prompted once per boot
fi
----

2. Save and reload: `source ~/.bashrc`

For more advanced persistent agent across reboots (using `keychain` tool, recommended for passphrase reuse):

1. Install keychain: `sudo apt install keychain` (Ubuntu) or equivalent.
2. Add to `~/.bashrc`:

[source,sh]
----
eval $(keychain --eval --agents ssh id_rsa)
----

This starts the agent only if not running and reuses the passphrase across sessions.

Alternatively, create a user systemd service for per-user automatic start:

1. Create `~/.config/systemd/user/ssh-agent.service`:

[source]
----
[Unit]
Description=SSH key agent

[Service]
Type=simple
Environment=DISPLAY=:0  # If needed for GUI
ExecStart=/usr/bin/ssh-agent -D -a $XDG_RUNTIME_DIR/ssh-agent.socket
ExecStop=/usr/bin/ssh-agent -k

[Install]
WantedBy=default.target
----

2. Reload and enable:

[source,sh]
----
systemctl --user daemon-reload
systemctl --user enable ssh-agent.service
systemctl --user start ssh-agent.service
----

3. Add to `~/.bashrc` or `~/.profile`:

[source,sh]
----
export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/ssh-agent.socket"
export SSH_AGENT_PID=  # Let ssh-agent set it
----

==== macOS

macOS often starts ssh-agent automatically via launchd for GUI sessions. To ensure it for all sessions:

1. Add to `~/.zshrc` or `~/.bash_profile`:

[source,sh]
----
eval "$(ssh-agent -s)"
ssh-add -q ~/.ssh/id_rsa  # Quiet add; passphrase prompted
----

For persistent passphrase management, use `ssh-add -K` (adds to keychain):

[source,sh]
----
ssh-add --apple-use-keychain ~/.ssh/id_rsa
----

And add to profile:

[source,sh]
----
ssh-add -q --apple-use-keychain ~/.ssh/id_rsa 2>/dev/null
----

To create a launchd plist for automatic start:

1. Create `~/Library/LaunchAgents/org.openbsd.ssh-agent.plist`:

[source,xml]
----
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.openbsd.ssh-agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/ssh-agent</string>
        <string>-l</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>SocketActivation</key>
    <dict>
        <key>ListenStreams</key>
        <array>
            <dict>
                <key>SockServiceName</key>
                <string>ssh-agent</string>
            </dict>
        </array>
    </dict>
</dict>
</plist>
----

2. Load it: `launchctl load ~/Library/LaunchAgents/org.openbsd.ssh-agent.plist`

==== Windows

After installing OpenSSH Client:

1. Open PowerShell as Administrator.

2. Set the service to automatic startup:

[source,powershell]
----
Set-Service -Name ssh-agent -StartupType Automatic
----

3. Start the service:

[source,powershell]
----
Start-Service ssh-agent
----

The service will now start automatically on boot and run persistently.

To add keys on startup, you can create a scheduled task or add to your PowerShell profile (`$PROFILE`), but for passphrase-protected keys, you'll need to enter the passphrase manually or use Windows Credential Manager integration (via `ssh-add` with pageant-like tools or PowerShell scripts).

For Git Bash users, add to `~/.bashrc`:

[source,sh]
----
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
----

== Gotchas with SSH tools

While the config file can reference SSH keys in other directories, Git GUI and many other SSH key management tools do not recognize any keys that are not directly present in the ~/.ssh directory, because they only look in the predefined directory and do not parse the config file to search for keys.

GitHub will fail to conduct operations if no SSH keys are registered to the ssh-agent process, even if those keys are mentioned in the config file.

Conventional advice says that the SSH-agent tool is only necessary if you intend to use SSH keys that are password-protected. However, many tools, like GitHub Desktop, are intimately dependent on ssh-agent for their core operations, despite no reason for it to be required.

=== Windows: Git Uses Its Own SSH Client (Critical!)

[IMPORTANT]
====
This is a *major source of confusion* on Windows. Even if you have set up OpenSSH correctly and `ssh -T git@github.com` works perfectly in PowerShell, Git operations like `git push` can still fail with "Permission denied (publickey)".
====

*The Problem:* Git for Windows bundles its own SSH client from MSYS2 (located at `C:\Program Files\Git\usr\bin\ssh.exe`). By default, Git uses this bundled SSH instead of the Windows OpenSSH client (`C:\Windows\System32\OpenSSH\ssh.exe`). The bundled SSH does *not* have access to the Windows ssh-agent service where your keys are loaded.

*Symptoms:*

* `ssh -T git@github.com` works in PowerShell: "Welcome to GitHub!"
* `git push` fails: "Permission denied (publickey)"
* `ssh-add -l` shows your keys loaded
* You've verified the remote URL is correct with `git remote -v`

*The Fix:* Configure Git to use the Windows OpenSSH client globally:

[source,powershell]
----
git config --global core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"
----

This tells Git to use the Windows SSH client that has access to the Windows ssh-agent service.

*Verification:*

[source,powershell]
----
# Check the current SSH command configuration
git config --get core.sshCommand

# Test that Git operations now work
git ls-remote origin
----

[TIP]
====
Add this configuration step to your Windows setup checklist. This single line of configuration can save hours of frustrating debugging.
====

*Why This Happens:* Git for Windows is built on MSYS2, a minimal GNU environment for Windows. It includes its own versions of Unix tools including SSH. While this provides a consistent experience across platforms, it creates a split where the Windows ecosystem (OpenSSH, ssh-agent service, Credential Manager) and the Git/MSYS2 ecosystem operate independently. Neither the Git developers nor Microsoft have addressed this integration gap, leaving users to discover the solution through trial and error.

*Alternative Solutions:*

1. **Use HTTPS instead of SSH:** Configure your remote to use `https://` URLs instead of `git@` SSH URLs. This uses Git's credential helper system instead of SSH keys.

2. **Use Git Bash exclusively:** Git Bash can start its own ssh-agent that the bundled SSH can access. Add to `~/.bashrc`:
+
[source,sh]
----
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519
----
+
However, this means you need to use Git Bash for all Git operations, not PowerShell or other terminals.

3. **Use a third-party SSH agent:** Tools like Pageant (from PuTTY) or 1Password's SSH agent can bridge this gap, but add complexity.

```

```asciidoc
= Code Sync

Developers commonly like to work on code using multiple computers. While git can technically synchronize code between machines, it is not a good solution. First, you have to handle conflicts by inspecting the code, which can take time. Second, the code that you commit to your repository should not be unfinished or incomplete, as it can lead to confusion in a team and more complex git history to look at when you need to roll back changes.

Many AI tools suggest using Syncthing. This tool is great on Linux and macOS, while Windows requires a specific 3rd party GUI. While the core Syncthing CLI tool works on Windows, most GUIs lack good support. No self-respecting Windows user will ever use a command line tool to sync files. File sync is something that should be automated with a background service or shown in a GUI, or both. The correct GUI to use on Windows is SyncTrayzor from GermanCoding on GitHub: link:https://github.com/GermanCoding/SyncTrayzor[SyncTrayzor].

`Syncthing Windows Setup` is a recommended project, but its installation process can be confusing, requiring hand-hacking the registry to enable obscure features that are typically disabled for security reasons.

In the future, I would like to see Syncthing attempt to port their web GUI to Yew and Tauri. Yew is a Rust-based web framework that is gaining popularity for its performance and ease of use, while Tauri is a Rust-based framework for building native desktop applications. Both of these use HTML and CSS to code the user interface.

== Sync Caveats

== Related Topics

* xref:sync-by-gemini.adoc[Sync by Gemini]
* xref:sync-grok4.adoc[Sync Grok4]


```

```asciidoc
|| `pnpm-lock.yaml` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds for `pnpm`.
|===

== Related Topics

* xref:pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving Mechanisms]

```

```asciidoc
|| `pnpm-lock.yaml` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds for `pnpm`.
|===

== Related Topics

* xref:pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving Mechanisms]

```

```asciidoc
= Node.js Environment, Tools, and Management

Node's libraries/packages can be managed using different package managers. By default, it uses `npm`.

`pnpm` is a fast alternative to `npm` that saves on disk space by linking a project to globally-installed files on the machine.

Node.js projects often contain configuration files for package managers:

[cols="1,1"]
|===

== Related Topics

* xref:pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving Mechanisms]

| common:
| `package.json` defines the project’s basic dependencies and configuration.

| `npm`
| `package-lock.json` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds.

| `pnpm`
| `pnpm-lock.yaml` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds for `pnpm`.
|===

== Related Topics

* xref:pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving Mechanisms]

```

```asciidoc
= Node.js Environment, Tools, and Management

Node's libraries/packages can be managed using different package managers. By default, it uses `npm`.

`pnpm` is a fast alternative to `npm` that saves on disk space by linking a project to globally-installed files on the machine.

Node.js projects often contain configuration files for package managers:

[cols="1,1"]
|===
| common:
| `package.json` defines the project’s basic dependencies and configuration.

| `npm`
| `package-lock.json` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds.

| `pnpm`
| `pnpm-lock.yaml` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds for `pnpm`.
|===

== Related Topics

* xref:pnpm-disk-space-saving-mechanisms.adoc[pnpm Disk Space Saving Mechanisms]

```

I have completed the reorganization and standardization of the `Z:\code\devcntr-app\dev-center\docs\modules\knowledge-base` directory.

### Summary of Changes

#### 1. File Renaming & Standardization
Renamed files to follow **kebab-case** and standardized main section files to use the `index.adoc` pattern for consistency:
- `pages/ssh-keys/SSH Keys.adoc` → `pages/ssh-keys/ssh-keys.adoc`
- `pages/nodejs/nodejs.adoc` → `pages/nodejs/index.adoc`
- `pages/flutter/dartSDK-setup.adoc` → `pages/flutter/dart-sdk-setup.adoc`
- `pages/asciidoc/asciidoc-tools.adoc` → `pages/asciidoc/index.adoc`
- `pages/file-sync/sync.adoc` → `pages/file-sync/index.adoc`
- `pages/git/git-repo-management.adoc` → `pages/git/index.adoc`

#### 2. Relocated Non-Renderable Files
Moved scripts and raw text files to the appropriate Antora directories to prevent them from being rendered as broken pages:
- **Attachments**: 
    - `attachments/git/git-ssh-ux-bug-report.txt`
    - `attachments/ssh-keys/setup-linux.sh`
    - `attachments/ssh-keys/setup-windows.ps1`
- Cleaned up empty source directories.

#### 3. Updated Navigation (`nav.adoc`)
Refreshed the navigation structure to reflect the new file paths and included previously missing files:
- Updated all links to use the new `index.adoc` and kebab-case filenames.
- Added `Sync by Gemini` and `Sync Grok4` to the File Sync section.
- Removed direct `xref` links to scripts, as they are now handled as attachments within the relevant pages.

#### 4. Fixed Internal Links & References
- Updated the module landing page (`pages/index.adoc`) with the new standardized paths.
- Fixed references in `pages/ssh-keys/ssh-keys.adoc` to point to the new attachment locations for the setup scripts.
- Added "Related Topics" sections to `pages/file-sync/index.adoc` and `pages/nodejs/index.adoc` to improve discoverability of sub-pages.

The module is now logically organized and follows Antora best practices.

---

**User**

tailwind setup in 'development tools' folder is a bit obtuse. most of the pages are about development tools, are they not? that folder was created because I moved a team introduction doc from foodtrucknerds into this knowledge base. I think it just wasn't integrated that well. But I like the quick-start aspect of it (index.adoc). What can we do?

---

**Cursor**

That is a great observation. Since almost everything in this module is a "development tool" (Git, Node.js, Flutter, etc.), having a separate folder called `development-tools` just for a general list and Tailwind creates a redundant and confusing hierarchy.

To integrate this better and preserve the "Quick Start" feel you like, I propose the following plan:

### 1. Promote "Recommended Tools" to the Landing Page
Move the content of `pages/development-tools/index.adoc` (the list of UniGetUI, Gittyup, Warp, etc.) directly into the main `pages/index.adoc`. 
*   This transforms the Knowledge Base landing page into a **"Quick Start / Environment Setup"** guide.
*   The "Topics" (Git, Node, etc.) will be moved to a section at the bottom of this new landing page, grouped logically.

### 2. Move Tailwind to a Dedicated Topic
Move `tailwind-setup.adoc` into a more descriptive folder.
*   **Path**: `pages/styling/tailwind.adoc` (or `pages/frontend/tailwind.adoc`).
*   This treats Tailwind as a specific technical topic like Git or Node.js, rather than a "tool" hidden in a generic folder.

### 3. Cleanup & Navigation Updates
*   **Delete** the now-redundant `development-tools` directory.
*   **Update `nav.adoc`** to reflect the flatter, more logical structure.
*   **Categorize Topics** on the landing page to make them easier to scan:
    *   **Core Infrastructure**: Git, SSH, Node.js
    *   **Frontend & Styling**: Tailwind, Flutter
    *   **Productivity**: File Sync, AsciiDoc

**Does this sound like a better way to integrate that "team introduction" content?**

---

**User**

There is a categorical difference between the tailwind document and the rest of the development tools documents. Please organize the tools based on their layering/abstraction level. Show me the plan first

---

**Cursor**

I have designed a plan to organize the Knowledge Base using **Layers of Abstraction**, moving away from the generic "Development Tools" bucket and clearly separating system-level setup from high-level frameworks like Tailwind.

### The Abstraction Layers
1.  **Access & Connectivity** (Bottom Layer): How you securely connect to services.
2.  **Platform & Shell** (System Layer): The terminal, shell, and OS-level utilities you use to interact with the computer.
3.  **Runtimes & SDKs** (Environment Layer): The language engines (Node, Flutter) required to run code.
4.  **Version Control & Management** (Workflow Layer): Tracking changes (Git) and managing software (UniGetUI).
5.  **Synchronization** (Process Layer): Keeping development environments consistent across machines.
6.  **Frameworks & Standards** (High Layer): The building blocks of the actual applications (Tailwind) and documentation (AsciiDoc).

---

### Proposed Action Plan

#### 1. Reorganize into Layered Folders
I will create a new directory structure that reflects these levels:
*   `access/` (formerly `ssh-keys/`)
*   `platform/` (The OS-level tools currently in `development-tools`)
*   `runtimes/` (Node.js and Flutter)
*   `version-control/` (Git and Git GUIs)
*   `sync/` (formerly `file-sync/`)
*   `frameworks/` (Tailwind)
*   `standards/` (formerly `asciidoc/`)

#### 2. Specific Moves & Refactors
*   **Frameworks**: Move `tailwind-setup.adoc` to `pages/frameworks/tailwind.adoc`. This isolates it as a high-level technology choice.
*   **Platform**: Extract the "Recommended Tools" (Windows Terminal, Warp, PowerShell, Sudo, UniGetUI) from the old index and place them in `pages/platform/index.adoc`.
*   **Version Control**: Move Git and the Git GUI recommendations (Gittyup, etc.) into `pages/version-control/`.
*   **Standardization**: Ensure every folder has a clear `index.adoc` as its entry point.

#### 3. Update Navigation & Landing Page
*   **`nav.adoc`**: I will restructure the navigation to follow these layers, making it clear how a developer "levels up" from hardware access to application frameworks.
*   **Module `index.adoc`**: I will rewrite the module landing page to explain this "Developer Stack" philosophy, helping the team understand where to find specific information based on what level of the stack they are working on.

**Does this organization by layering align with how you see the difference between the tools and the frameworks?**

---

**User**

Based on the diataxis model mentioned in @z:\code\devcntr-app\dev-center\docs\User Documentation Learning Modes.md  generate distinct documentation for each mode of learning in their own trees and make the user choose between them on the documentation front page. Front page should be orientation to the documentation with a quick introduction to the app's purpose first. If done correctly, common snippets should be shared between documents. Formulate a plan. Use the Ordering in @z:\code\devcntr-app\dev-center\docs\Organizing Development Layers_ Two Models.md 's onboarding section for the tutorial mode. The tool recommendations page should be separate from the orientation/front page perhaps in the reference section, but a small link, mention, or snippet should be embedded in the front page.

---

**Cursor**

This is a significant architectural shift that will align the Knowledge Base with professional documentation standards. By separating content into **Diátaxis modes** and using the **Onboarding Path** for the tutorial, we create a clear distinction between "learning to use the system" and "using the system to work."

Here is the plan to restructure the Knowledge Base:

### 1. New Directory Structure
I will organize the `pages/` directory into four main branches, plus a `partials/` directory for shared content:

*   `partials/`: Fragments of code or text used in multiple places (e.g., `ssh-keygen` commands, `pnpm` install steps).
*   `pages/tutorials/`: The **Onboarding Path**. A single, linear guide (or series) moving through:
    1.  **Platform** (Terminal/Shell)
    2.  **Access** (SSH)
    3.  **Workflow** (Git/pnpm)
    4.  **Runtimes** (Node/Flutter)
    5.  **Frameworks** (Tailwind/AsciiDoc)
    6.  **Sync** (Environment persistence)
*   `pages/how-to/`: Task-oriented recipes (e.g., "How to fix line endings," "How to add a SSH key to GitHub").
*   `pages/reference/`: Technical facts, including the **Tool Recommendations** list.
*   `pages/explanation/`: Conceptual "Why" documents (e.g., why we prioritize the right hemisphere in UI design).

---

### 2. Implementation Steps

#### A. Content Extraction (Partials)
I will move repeated technical instructions into `partials/` so they can be `include::`ed in both the **Tutorial** (where they are part of a story) and **How-to** (where they are part of a recipe).
*   *Example*: The SSH generation command will live in a partial and be used in the "Access" step of the tutorial AND the "Generate a Key" how-to.

#### B. The Landing Page (`pages/index.adoc`)
I will rewrite the main index to act as a **Router**:
1.  **Introduction**: Define the "Dev Center" app’s purpose (centralizing developer intelligence and workflow).
2.  **Orientation**: Briefly explain the four modes (Diátaxis) so users know where to click.
3.  **Quick Links**: 
    *   A prominent "Start Onboarding" button.
    *   A snippet/link to the "Recommended Tools" reference page.

#### C. The Tutorial (`pages/tutorials/onboarding.adoc`)
I will synthesize a master tutorial that follows the onboarding order. It will focus on "getting your first commit pushed" as the success metric.

#### D. Reference & Tooling
The `development-tools` content will be refactored into `pages/reference/tool-recommendations.adoc`.

#### E. Navigation (`nav.adoc`)
I will restructure the navigation tree to group by these four modes, making the documentation "logical mapping" visible at a glance.

---

### 3. File Move Map (Draft)
*   `pages/ssh-keys/ssh-keys.adoc` → `pages/how-to/setup-ssh.adoc` (How-to) & `pages/explanation/ssh-security.adoc` (Explanation).
*   `pages/development-tools/index.adoc` → `pages/reference/recommended-tools.adoc`.
*   `pages/development-tools/tailwind-setup.adoc` → `pages/how-to/setup-tailwind.adoc`.
*   `pages/git/index.adoc` → Split between `pages/reference/git-cheat-sheet.adoc` and `pages/how-to/git-workflow.adoc`.

**Shall I proceed with creating the partials and restructuring the directories according to this plan?**

---

**User**

yes

---

**Cursor**

```asciidoc
[source,sh]
----
ssh-keygen -t ed25519 -C "your_email@example.com"
----

```

```asciidoc
[source,sh]
----
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
----

```

```asciidoc
[source,powershell]
----
# Set the service to automatic startup
Set-Service -Name ssh-agent -StartupType Automatic

# Start the service
Start-Service ssh-agent
----

```

```asciidoc
[source,bash]
----
git config --global core.autocrlf input
----

```

```asciidoc
[source,html]
----
<script src="https://cdn.tailwindcss.com"></script>
----

```

```asciidoc
[source,sh]
----
npm install tailwindcss @tailwindcss/cli
----

```

```asciidoc
= Knowledge Base Orientation

Welcome to the Dev Center Knowledge Base. This is the central repository for technical intelligence, best practices, and the collective memory of our engineering team.

== App Purpose
The **Dev Center** application is designed to be the single source of truth for our development ecosystem. It centralizes project metadata, automates repetitive setup tasks, and provides a unified interface for managing developer identities across the services we use every day.

== How to Use This Documentation
We follow the **Diátaxis** framework, which organizes documentation by the user's intent and cognitive state. Choose the path that matches your current goal:

[cols="1,1", frame=none, grid=none]
|===
| [.text-center]
=== 🎓 Tutorials
**Intent: Learning**
Focused on acquisition. Follow our step-by-step guides to build basic competence in our systems.

xref:tutorials/onboarding.adoc[🚀 Start Onboarding]

| [.text-center]
=== 🛠️ How-to Guides
**Intent: Execution**
Focused on application. "I have a goal, show me the recipe." Task-oriented guides for real-world problems.

xref:how-to/index.adoc[📂 Browse How-tos]

| [.text-center]
=== 📚 Reference
**Intent: Retrieval**
Focused on facts. Technical specifications, API documentation, and checklists.

xref:reference/index.adoc[📋 View Reference]

| [.text-center]
=== 🧠 Explanation
**Intent: Comprehension**
Focused on understanding. Discursive content that explains the "Why" behind our architecture and philosophy.

xref:explanation/index.adoc[💡 Explore Concepts]
|===

[TIP]
====
**Quick Start:** If you are new to the team, start with the xref:tutorials/onboarding.adoc[Onboarding Tutorial]. It will guide you through setting up your machine using our xref:reference/recommended-tools.adoc[Recommended Tools].
====

```

```asciidoc
= Recommended Development Tools

We recommend these tools to improve your dev workflow and maintain consistency across the team.

== Platform & Shell

* link:https://apps.microsoft.com/detail/9N0DX20HK701[Windows Terminal] - Official Terminal rewrite from Microsoft.
* link:https://www.warp.dev/[Warp] - Modern terminal with integrated AI and superior UX.
* link:https://apps.microsoft.com/detail/9mz1snwt0n5d[PowerShell 7] - The modern cross-platform shell.
* link:https://learn.microsoft.com/en-us/windows/advanced-settings/sudo/[`sudo` for Windows] - Run elevated commands easily.

== Package Management

* link:https://www.marticliment.com/unigetui/[UniGetUI] - A GUI for `winget` and other package managers. Use this to install most of the apps below.
* `pnpm` - Fast, disk-efficient package manager for Node.js.

== Version Control

* link:https://murmele.github.io/Gittyup/[Gittyup] - Clean Git UX for those who prefer GUIs over CLI.
* link:https://cli.github.com/[GitHub CLI] - Official GitHub command-line interface.

== Connectivity & Security

* link:https://github.com/masahide/OmniSSHAgent[OmniSSHAgent] - Improved SSH agent management for Windows.
* link:https://github.com/frequency403/OpenSSH-GUI[OpenSSH-GUI] - Graphical interface for managing SSH keys.

== Productivity

* link:https://jam.dev[Jam.dev] - One-click bug reporting with logs and video.
* link:https://chromewebstore.google.com/detail/visbug/cdockenadnadldjbbgcallicgledbeoc[VisBug] - Live design debugging in the browser.

```

```asciidoc
= Developer Onboarding: Zero to One

This tutorial will guide you through setting up your development environment from scratch. Our goal is to get you from a fresh machine to your first successful code contribution.

== 1. Platform Setup (First Contact)
Before you can write code, you need a modern environment to work in.

1. Install **Windows Terminal** and **PowerShell 7** from the Microsoft Store.
2. Install **UniGetUI** to manage your software packages.
3. Enable **sudo for Windows** in your system settings.

== 2. Access (The Gate)
To interact with our repositories, you need a secure identity.

1. Generate a new SSH key using the recommended Ed25519 algorithm:
+
include::partial$ssh-keygen-ed25519.adoc[]

2. Start the SSH Agent service:
+
include::partial$ssh-agent-windows-start.adoc[]

3. Add your public key to your GitHub account settings.

== 3. Workflow (The Process)
With access granted, let's configure your local workflow.

1. Configure Git to handle line endings correctly (crucial for Windows users):
+
include::partial$git-autocrlf-input.adoc[]

2. Install **pnpm** globally:
+
[source,sh]
----
npm install -g pnpm
----

== 4. Runtimes (The Engine)
Install the execution engines required for our projects.

1. Install **Node.js (LTS)** via UniGetUI or the official installer.
2. Verify the installation:
+
[source,sh]
----
node --version
pnpm --version
----

== 5. Frameworks (The Work)
Most of our web projects use **Tailwind CSS** for styling.

1. For a quick start in a static project, you can use the CDN:
+
include::partial$tailwind-cdn.adoc[]

2. For production projects, install it via the CLI:
+
include::partial$tailwind-cli-install.adoc[]

== 6. Sync (Persistence)
To maintain consistency across multiple machines, we use **Syncthing**.

1. Install **SyncTrayzor** (on Windows).
2. Configure your project folders to sync between your primary and secondary dev machines.

---

**Congratulations!** Your environment is now fully configured. You are ready to clone your first repository and start building.

```

```asciidoc
= How-to Guides

Practical recipes for real-world tasks.

* xref:how-to/flutter-setup.adoc[Flutter Setup]
* xref:how-to/tailwind-setup.adoc[Tailwind Setup]
* xref:how-to/file-sync.adoc[File Sync]
* xref:how-to/git-ignore-local.adoc[.gitignore.local]
* xref:how-to/git-hooks.adoc[Git Hooks]
* xref:how-to/git-lfs.adoc[Large Files & LFS]
* xref:how-to/git-recovery.adoc[Git Recovery & Troubleshooting]

```

```asciidoc
= Technical Reference

Dry, technical facts and specifications.

* xref:reference/recommended-tools.adoc[Recommended Development Tools]
* xref:reference/git-management.adoc[Git Repository Management]
* xref:reference/nodejs-env.adoc[Node.js Environment]
* xref:reference/asciidoc-tools.adoc[AsciiDoc Tooling]

```

```asciidoc
= Concept Explanations

Discursive and conceptual content to facilitate a deeper mental model.

* xref:explanation/ssh-keys.adoc[SSH Keys Explained]
* xref:explanation/git-branching.adoc[Branching Strategies]
* xref:explanation/git-submodules.adoc[Submodules & Monorepos]
* xref:explanation/pnpm-mechanics.adoc[pnpm Disk Space Saving Mechanics]
* xref:explanation/sync-by-gemini.adoc[Sync Strategy: Gemini]
* xref:explanation/sync-grok4.adoc[Sync Strategy: Grok4]

```

```asciidoc
* xref:index.adoc[Knowledge Base]

.🎓 Tutorials
* xref:tutorials/onboarding.adoc[Developer Onboarding]

.🛠️ How-to Guides
* xref:how-to/index.adoc[Overview]
* xref:how-to/flutter-setup.adoc[Flutter Setup]
* xref:how-to/tailwind-setup.adoc[Tailwind Setup]
* xref:how-to/file-sync.adoc[File Sync]
* xref:how-to/git-ignore-local.adoc[.gitignore.local]
* xref:how-to/git-hooks.adoc[Git Hooks]
* xref:how-to/git-lfs.adoc[Large Files & LFS]
* xref:how-to/git-recovery.adoc[Git Recovery]

.📚 Reference
* xref:reference/index.adoc[Overview]
* xref:reference/recommended-tools.adoc[Recommended Tools]
* xref:reference/git-management.adoc[Git Management]
* xref:reference/nodejs-env.adoc[Node.js Environment]
* xref:reference/asciidoc-tools.adoc[AsciiDoc Tooling]

.🧠 Explanation
* xref:explanation/index.adoc[Overview]
* xref:explanation/ssh-keys.adoc[SSH Keys]
* xref:explanation/git-branching.adoc[Branching Strategies]
* xref:explanation/git-submodules.adoc[Submodules & Monorepos]
* xref:explanation/pnpm-mechanics.adoc[pnpm Mechanics]
* xref:explanation/sync-by-gemini.adoc[Sync: Gemini]
* xref:explanation/sync-grok4.adoc[Sync: Grok4]

```

```asciidoc
= Code Sync

Developers commonly like to work on code using multiple computers. While git can technically synchronize code between machines, it is not a good solution. First, you have to handle conflicts by inspecting the code, which can take time. Second, the code that you commit to your repository should not be unfinished or incomplete, as it can lead to confusion in a team and more complex git history to look at when you need to roll back changes.

Many AI tools suggest using Syncthing. This tool is great on Linux and macOS, while Windows requires a specific 3rd party GUI. While the core Syncthing CLI tool works on Windows, most GUIs lack good support. No self-respecting Windows user will ever use a command line tool to sync files. File sync is something that should be automated with a background service or shown in a GUI, or both. The correct GUI to use on Windows is SyncTrayzor from GermanCoding on GitHub: link:https://github.com/GermanCoding/SyncTrayzor[SyncTrayzor].

`Syncthing Windows Setup` is a recommended project, but its installation process can be confusing, requiring hand-hacking the registry to enable obscure features that are typically disabled for security reasons.

In the future, I would like to see Syncthing attempt to port their web GUI to Yew and Tauri. Yew is a Rust-based web framework that is gaining popularity for its performance and ease of use, while Tauri is a Rust-based framework for building native desktop applications. Both of these use HTML and CSS to code the user interface.

== Sync Caveats

== Related Topics

* xref:explanation/sync-by-gemini.adoc[Sync by Gemini]
* xref:explanation/sync-grok4.adoc[Sync Grok4]


```

```asciidoc
= Node.js Environment, Tools, and Management

Node's libraries/packages can be managed using different package managers. By default, it uses `npm`.

`pnpm` is a fast alternative to `npm` that saves on disk space by linking a project to globally-installed files on the machine.

Node.js projects often contain configuration files for package managers:

[cols="1,1"]
|===
| common:
| `package.json` defines the project’s basic dependencies and configuration.

| `npm`
| `package-lock.json` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds.

| `pnpm`
| `pnpm-lock.yaml` locks down the entire dependency tree to specific versions, ensuring consistent and reproducible builds for `pnpm`.
|===

== Related Topics

* xref:explanation/pnpm-mechanics.adoc[pnpm Disk Space Saving Mechanisms]

```

```asciidoc
= Git Repository Management

Git repository management encompasses the practices, configurations, and workflows needed to effectively maintain version-controlled projects. This document covers common configuration concerns and troubleshooting topics.

For complex topics that warrant deeper coverage, see the related documents linked below.

== Line Endings Configuration

Git warns about line ending inconsistencies when files in your working directory use different line endings than what Git expects. Windows typically uses **CRLF** (Carriage Return, Line Feed) line endings, while Linux and macOS use **LF** (Line Feed).

Git's `core.autocrlf` setting controls automatic conversion:

* `true` (Windows default): Converts LF to CRLF on checkout, CRLF to LF on commit
* `input`: Converts CRLF to LF on commit only (no conversion on checkout)
* `false`: No conversion

=== Resolution Options

==== Option 1: Configure Git for Consistency (Recommended)

Set Git to handle line endings for consistency across operating systems. This is best configured globally or per-repository.

===== Step 1: Set `core.autocrlf` to `input`

This tells Git to convert CRLF to LF on commit, but _not_ to convert LF to CRLF on checkout.

.Global setting (affects all repositories):
[source,bash]
----
git config --global core.autocrlf input
----

.Repository-specific setting:
[source,bash]
----
git config core.autocrlf input
----

===== Step 2: Normalize the Repository

After changing the setting, normalize the repository by running a reset. This ensures all files in the index use the standard LF ending.

[source,bash]
----
git rm --cached -r .
git reset --hard HEAD
----

This removes files from the staging area (`git rm --cached -r .`) and then restores the working directory to the last committed state (`git reset --hard HEAD`), applying the new `core.autocrlf` rule during the checkout.

==== Option 2: Configure VS Code to Use LF

If you want your files to _always_ use LF in your working directory, regardless of Git's setting, configure VS Code.

. Open **VS Code Settings** (File > Preferences > Settings or `Ctrl+,`)
. Search for **"files: eol"** or **"eol"**
. Set the **`Files: Eol`** setting to **`\n`** (for LF)

[NOTE]
====
This only affects new files or files saved in VS Code. For existing files, you may need to manually change their line endings in VS Code (check the status bar on the bottom right of the editor for line ending type, e.g., "CRLF" or "LF", and click it to change).
====

==== Option 3: Suppress the Warning (Not Recommended)

If you understand the issue and accept the automatic conversion, you can suppress the warning by setting `core.safecrlf` to `false`.

[WARNING]
====
This is **not recommended** as it masks a potential source of inconsistent commits.
====

[source,bash]
----
git config --global core.safecrlf false
----

=== Line Endings Summary

[cols="1,2,2"]
|===
| Setting | Value | Effect

| `core.autocrlf`
| `true`
| Convert LF→CRLF on checkout, CRLF→LF on commit (Windows default)

| `core.autocrlf`
| `input`
| Convert CRLF→LF on commit only (recommended for cross-platform)

| `core.autocrlf`
| `false`
| No automatic conversion

| `core.safecrlf`
| `false`
| Suppress line ending warnings (not recommended)
|===

== Related Topics

* xref:how-to/git-ignore-local.adoc[.gitignore.local Convention] - Local ignore files
* xref:explanation/git-branching.adoc[Branching Strategies] - Git flow, trunk-based development
* xref:how-to/git-hooks.adoc[Git Hooks] - Automation via commit hooks
* xref:how-to/git-lfs.adoc[Large Files & LFS] - Handling binary assets
* xref:explanation/git-submodules.adoc[Submodules & Monorepos] - Multi-repository patterns
* xref:how-to/git-recovery.adoc[Recovery & Troubleshooting] - Reflog, reset, and fixing mistakes

```

```asciidoc
= Git Branching Strategies

// TODO: Document common branching strategies

== Overview

This document will cover common Git branching strategies and when to use each.

== Topics to Cover

* [ ] Git Flow - Feature branches, develop, release, hotfix
* [ ] GitHub Flow - Simplified branch-per-feature workflow
* [ ] Trunk-Based Development - Short-lived branches, continuous integration
* [ ] Release branching patterns
* [ ] Branch naming conventions
* [ ] Branch protection rules

== See Also

* xref:reference/git-management.adoc[Git Repository Management]


```

```asciidoc
= Git Hooks

// TODO: Document Git hooks setup and common use cases

== Overview

This document will cover Git hooks for automating tasks during the Git workflow.

== Topics to Cover

* [ ] Hook types (pre-commit, post-commit, pre-push, etc.)
* [ ] Setting up hooks manually
* [ ] Husky for Node.js projects
* [ ] pre-commit framework for Python projects
* [ ] Common hook scripts (linting, formatting, commit message validation)
* [ ] Sharing hooks across a team

== See Also

* xref:reference/git-management.adoc[Git Repository Management]


```

```asciidoc
= Large Files & Git LFS

// TODO: Document Git LFS and large file handling strategies

== Overview

This document will cover handling large files and binary assets in Git repositories.

== Topics to Cover

* [ ] Why Git struggles with large files
* [ ] Git LFS (Large File Storage) setup and usage
* [ ] `.gitattributes` configuration for LFS
* [ ] Migrating existing repos to use LFS
* [ ] Alternatives to LFS (git-annex, DVC)
* [ ] Cost considerations for LFS hosting

== See Also

* xref:reference/git-management.adoc[Git Repository Management]


```

```asciidoc
= Git Recovery & Troubleshooting

// TODO: Document Git recovery techniques and common troubleshooting

== Overview

This document will cover recovering from mistakes and troubleshooting common Git issues.

== Topics to Cover

* [ ] Understanding the reflog
* [ ] Recovering deleted branches
* [ ] Recovering lost commits
* [ ] Undoing commits (reset, revert, amend)
* [ ] Fixing detached HEAD state
* [ ] Resolving merge conflicts
* [ ] Cleaning up a messy history (interactive rebase)
* [ ] Recovering from force push disasters

== See Also

* xref:reference/git-management.adoc[Git Repository Management]


```

```asciidoc
= Submodules & Monorepos

// TODO: Document Git submodules and monorepo patterns

== Overview

This document will cover multi-repository patterns including submodules and monorepo strategies.

== Topics to Cover

* [ ] Git submodules basics
* [ ] Adding, updating, and removing submodules
* [ ] Submodule pitfalls and common issues
* [ ] Monorepo vs polyrepo tradeoffs
* [ ] Monorepo tooling (Nx, Turborepo, Lerna)
* [ ] Sparse checkouts for large monorepos

== See Also

* xref:reference/git-management.adoc[Git Repository Management]


```

I have restructured the `knowledge-base` module to follow the **Diátaxis model**, organizing the documentation into four distinct learning modes: **Tutorials**, **How-to Guides**, **Reference**, and **Explanation**.

### New Architectural Highlights

1.  **Centralized Intelligence (Partials)**: I extracted high-value technical snippets (like SSH key generation, Git configurations, and Tailwind scripts) into a new `partials/` directory. These are now shared between the step-by-step Tutorial and the goal-oriented How-to guides, ensuring consistency and making updates easier.
2.  **The Onboarding Journey (Tutorial)**: I created a linear `onboarding.adoc` guide that follows the **Onboarding Path** model. It takes a new developer from "Zero to One" by ordering tasks chronologically: Platform Setup → Access → Workflow → Runtimes → Frameworks → Synchronization.
3.  **The Orientation Landing Page**: The main `index.adoc` now acts as a router. It introduces the purpose of the **Dev Center** app and provides a clear choice between the four learning modes, including a prominent call to action for new team members to start onboarding.
4.  **Reference & Tools**: The "Recommended Tools" have been moved to a dedicated reference page, cleanly separated from the onboarding narrative but linked directly from the front page for quick access.

### Restructured Navigation (`nav.adoc`)
The navigation tree is now grouped by cognitive intent:
*   **🎓 Tutorials**: For learning-oriented onboarding.
*   **🛠️ How-to Guides**: For problem-oriented task execution.
*   **📚 Reference**: For information-oriented retrieval of facts and tools.
*   **🧠 Explanation**: For understanding-oriented conceptual knowledge.

All internal cross-references (`xref:`) have been updated to reflect this new, flattened, and more logical directory structure.


