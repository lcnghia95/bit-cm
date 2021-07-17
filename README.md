bit-cm is a CLI written in Nodejs. It help you manager remote branch and pull request by simple command line.
This CLI follow [Bitbucket API](https://developer.atlassian.com/bitbucket/api/2/reference/resource/)

# Feature 
- Create branch
- Delete branch
- Reset branch
- Open pull request
- Merge pull request

# Install
You need install [nodejs](https://nodejs.org/). 
Make sure nodejs was installed `( node>= 12)`
```bash
$ node -v
$ npm -v
```

Install bit-cm
```bash
$ npm install -g bit-cm
```
Check bit-cm was installed
```bash
$ bcm -v
```

# Uninstall
```bash
$ npm uninstall -g bit-cm
$ rm -rf ~/.bcm
```

# Setup your config 
- Make sure your basic authentication bitbucket is set up
	```bash
	$ bcm set --basic-auth-username <username> 
	$ bcm set --basic-auth-password <password> 
	```

- Set default workspace
	```bash
	$ bcm set --default-workspace <workspace>
	```
- [What is a workspace ?](https://support.atlassian.com/bitbucket-cloud/docs/what-is-a-workspace)
	A workspace is where you will create repositories, collaborate on your code, and organize different streams of work in your Bitbucket Cloud account. At this time, you'll be provided with one workspace and one workspace ID.
	

- Check config
	```bash 
	$ bcm get
	```

# Comamnd line Document
### 1. Repositories list
- You can get your repositories list (limit 100 items):
	```bash
	$ bcm repo
	```
- Set alias for repositories by the way
	```bash
	# set index
	$ bcm repo --set-index-alias
	# check it
	$ bcm alias
	# or search aliasId by repo name
	$ bcm alias --search "something"
	```

### 2. Create branch 
- This command will create new branch from another source branch, please make sure source branch or default source branch is exist
- Command: `bcm new|n <repo|aliasId> <branch> [source]`
- Option 
	+ `-w <workspace>` or `--workspace <workspace>`
- Set aliasId follow `1. Repositories list` or if you've already done it:
	```bash
	$ bcm alias 
	#or
	$ bcm a
	```
- Set default source branch:
	```bash
	# another branch you want, my example is master
	$ bcm set --default-branch-create-from master
	```
- Examples:
	+ Full command:
		```bash 
		$ bcm new test-repo test-branch master
		```
	+ Short command:
		```bash
		# if not set default source branch
		$ bcm n 2 test-branch master
		# default source branch has aldready
		$ bcm n 2 test-branch
		```

### 3. Delete branch 
- Command: `bcm delete|d <repo|aliasId> <branch>`
- Option 
	+ `-w <workspace>` or `--workspace <workspace>`
- Examples:
	+ Full command:
		```bash
		$ bcm delete test-repo test-branch
		```
	+ Short command:
		```bash
		$ bcm d 2 test-branch
		```

### 4. Reset branch
- This command will delete and recreate branch from another source branch, please make sure source or default source branch is exist
- Command: `bcm reset|r <repo|aliasId> [branch] [source]`
- Option 
	+ `-w <workspace>` or `--workspace <workspace>`
- Set default source branch. Your branch you want reset will recreate from this:
	```bash
	# another branch you want, my example is master
	$ bcm set --default-branch-reset-from master
	```
- Set default branch will reset. 
	```bash
	# another branch you want, my example is master
	$ bcm set --default-branch-reset staging 
	```
- Examples:
	+ Full command:
		```bash
		$ bcm reset test-repo test-branch master
		```
	+ Short command:
		```bash
		# if you not set default branch
		$ bcm r 2 test-branch master
		# if default destination branch has aldready
		$ bcm r 2 test-branch
		# if default destination branch and default branch reset has aldready
		$ bcm r 2 # mean delete staging and recreate from master
		```
### 5. Open pull request
- This command will create pull request your into another branch. 
- Command: `bcm open|o <repo|aliasId> <branch> [destination]`
- Option 
	+ `-w <workspace>` or `--workspace <workspace>`
	+ `-t <title>` or `--title <title>` if you want set title or not title default is `branch name`
	+ `-m` or `--merge` if you want auto merge 
- Set default destination
	```bash
	# another branch you want, my example is master
	$ bcm set --default-branch-open-pull master
	```
- Examples:
	+ Full command
		```bash
		$ bcm open test-repo test-branch master
		```
	+ Short command
		```bash
		# if you not set default branch
		$ bcm o 2 test-branch master
		# if default destination branch has aldready
		$ bcm o 2 test-branch
		```

### 6. Merge pull request
- This command will merge your pull request by id
- Command: `bcm merge|m <repo|aliasId> <pullId>`
- Examples:
	+ Full command:
		```bash
		$ bcm merge test-repo 25
		```
	+ Short command:
		```bash
		$ bcm m 2 25
		```

# End
Thanks for spending your time to visit.
