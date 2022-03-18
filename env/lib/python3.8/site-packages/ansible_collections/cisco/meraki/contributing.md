# Contributing

Contributions are welcome, and they are greatly appreciated! This is a one man show
so help is fantastic!

You can contribute in many ways:

## Types of Contributions

### Report Bugs

Report bugs at https://github.com/CiscoDevNet/ansible-meraki/issues. 

### Fix Bugs or Complete Enhancements

Look through the GitHub issues for bugs. Anything without a pull request associated is
open.

### Submit Feedback

Request new features at https://github.com/CiscoDevNet/ansible-meraki/issues

If you are proposing a feature:

- Explain in detail how it would work.
- Keep the scope as narrow as possible, to make it easier to implement.
- Remember that this is a volunteer-driven project, and that contributions 
  are welcome :)

## Get Started!

Ready to contribute some code? Here's how to set up `cisco.meraki` for local development.

1. Install Python 3.8 or higher, along with Ansible

   Newer versions of Ansible require 3.8 so please target those versions.

2. Fork the `cisco.meraki` repo on GitHub.

3. Clone your fork locally, using a special directory name so that Ansible understands
   it as a collection:

```
$ mkdir -p ansible_collections/meraki
$ git clone https://github.com/your-username/ansible-meraki.git ansible_collections/ansible-meraki/
```

4. Create a branch for local development

```
$ cd ansible_collections/paloaltonetworks/panos
$ git checkout -b name-of-your-bugfix-or-feature
```

6. Now you can make your changes locally, and test them out by running
`ansible-playbook` from the `playbooks/` directory.

7. When you're done making changes, check that your changes pass `ansible-test sanity`:

```
$ ansible-test sanity --local
```

8. Commit your changes and push your branch to GitHub:

```
$ git add -A
$ git commit -m "Your detailed description of your changes."
$ git push origin name-of-your-bugfix-or-feature
```

9. Submit a pull request through the GitHub website.

## Publish a new release (for maintainers)

This workflow requires node, npm, and semantic-release to be installed locally:

```
$ npm install -g semantic-release@^17.1.1 @semantic-release/git@^9.0.0 @semantic-release/exec@^5.0.0 conventional-changelog-conventionalcommits@^4.4.0
```

### Test the release process

Run `semantic-release` on develop:

```
semantic-release --dry-run --no-ci --branches=develop
```

Verify in the output that the next version is set correctly, and the release notes are generated correctly.

### Merge develop to main and push

```
git checkout main
git merge develop
git push origin main
```

At this point, GitHub Actions builds the final release, and uploads it to Ansible Galaxy.

### Merge main to develop and push

Now, sync develop to main to add the new commits made by the release bot.

```
git fetch --all --tags
git pull origin main
git checkout develop
git merge main
git push origin develop
```

Now you're ready to branch again and work on the next feature.

