
# Epic: Minimum Viable Testable Product ("MVTP")

In this epic, we'll realize a set of job-stories to enable testing for
feedback with our most important early stakeholders: the organizational
development consultant, a manager at a Fortune 500 firm, and a product
manager at a post-Series A startup.

## Personae

- **Parabol Developer** ("PD")
- **Team Leader** ("TL")
- **Team Member** ("TM")
- **Meeting Facilitator** ("F")

## Job Stories

### Chores

- [X] When a PD develops code, they will want a reasonable set of eslinting
rules, so our code can be written in a common and consistent style.

- [X] When a PD develops code, they will want a framework for unit testing
code, so that we can we can run a basic suite of automated tests on
every commit.

- [X] When a PD pushes code to GitHub, they will want our automated code
quality tests to run, so that we can catch some breaking changes as they
happen.

- [X] When a PD wants to develop and run code, they will want to use ES6/7
and webpack, so they can write maximally expressive code that results in
a well-built (small, correct) set of distributables.

- [X] When the PD wants to push the latest version of Action to the
staging or production servers, they will want an easy automated mechanism
for doing so, so that our application can be deployed to external users with
ease.

- [X] When a PD wants to evolve the data model, they want to have an up/down
migration system, so changes can be distributed to other team members and
our production infrastructure.

- [X] When a user is authenticated, the PD will want to re-use these
authentication credentials securely across multiple connection types such as
HTTP and Websockets.

- [X] When a PD wants to query data from our databases(s), they want to use
a secure GraphQL endpoint, so that we don't have to write and support a
plethora of interfaces (among other benefits).

- [X] When the PD wants to request data from the front-end, they want
this data to be intelligently cached in the redux store (i.e. via Cashay),
so that we 1) write descriptive containers, 2) only request data from the
server when it is needed, 3) and ensure that components re-render only when
they need to.

- [X] When the PD wants to mutate data on the backend, they want this
data to be done through the cache interface optimistically, so that the
interface doesn't have to wait for the backend mutation to complete.

- [X] When the PD wants to subscribe to changes on the backend, they want
a pattern for adding, updating, and removing items (even on arrays),
so that multiple connected users can see the collaborative changes they in
real-time.

- [X] When the PD develops front-end components, they want to easily
be able to apply styles and change styles as components re-render, so that
they can make a beautiful interface.

- [X] When the PD wants to send an email, they will want a service
and interface for doing so – ideally with embedded images and easy HTML4
compliance, so we can send beautiful emails to a wide set of clients.

### On-boarding Team Leader

- [X] When TL navigates to landing page, they want the fastest way to create
an account and put behind any chores, so that they can get to evaluating
the product quickly.

- [X] When the TL creates an account, they want to receive an email welcoming
them into the system, so that they can later remember what they signed up for.

- [X] **(Assumption)** After TL creates an account, they are _willing_ to name
and create their first team, so that they can see how the product works.

- [X] **(Assumption)** After TL creates an account, they are _willing_ to
invite one other team mate, so that they can see how the product works with
another person.

- [ ] When a TL is unwilling to invite a teammate without understanding the
product, they want to skip this step, so that they don't involve others
into their process of exploration too prematurely.

- [X] When the TL invites their TMs, they want Action to send their TMs an
email with a simple CTA to get on-boarded, so they can begin working as a
team as quickly as possible.

## On-boarding Team Members

- [X] When a TM receives an invitation email, they want a clear description
of the request from their TL and a clear CTA, so that they can clear the
task from their leader off their list.

- [X] When a TM clicks on the CTA from the email, they want whatever
account creation tasks to occur as quickly as possible, so that they can
understand what they are being asked to do with a minimum of hassle.

- [ ] When a TM completes account creation, they want to understand what
their next step is (inputting projects, then waiting for their first action
meeting from their TL), so they feel like their are working toward some kind
of a tangible goal.

- [X] When a TM clicks on an invitation link and they _already_ have an
active account, the system should still process the invitation.

## Team Action Meeting

- [ ] **(Assumption)** After a TL has invited their team, they want to be
directed on the next step – scheduling their first action meeting with their
team, so that they can try working in a new way.

- [X] When it's time for the first Action meeting, the TL will want a clear
control to "Start The Meeting" from their team dashboard and an easy link to
distribute to team members, so that the meeting can be started easily and
TMs can be gathered.

- [X] When TMs click on the meeting link, they want a place to gather before
the meeting starts ("the lobby"), so that they can see who's online
and who's missing and that the meeting doesn't begin without anybody.

- [X] When the first TM (inclusive of the TL) joins, they'll want to know they
are the Facilitator ("F") and what this means, so that they know how to advance the
phases of the meeting.

- [ ] If the facilitator disconnects, the other TMs will want a new facilitator
chosen quickly, so the meeting can continue without interruption.

- [X] When a critical mass of TMs join the Lobby, the F wants to advance to
check-in round, so that they meeting can get underway.

- [X] When meeting phases advance, all TMs will want to how many more steps
are in this facilitated process, so they can understand the flow of the meeting
and get an intuitive sense for how long this meeting might take.

- [X] As individual items (team members, agenda items) are processed within a
given phase, TMs want to know how many more items are ahead of them, so that
they have a sense of how quickly they have to work through a phase.

- [X] When the TMs participate in check-in, they will want to process all
team members as "fully present" or "absent" (with either the facilitator or
the online TM controlling input for their check-in state), so that they can
have an opportunity to say something and build an attendance record.

- [X] When the last TM has checked-in, the facilitator wants to
advance the round to the project updates phase, so that the team can build
and understanding of the work their teammates are working on and who might
be stuck and need something from somebody else.

- [X] If a TM wants to refer to output earlier in the meeting, they want to be
able to click and navigate away from their other TMs, so that they can get or
update the information they seek.

- [X] When a the meeting is advanced to the project updates phase, the team
will want to see a list of projects by TM, so that each participant has a
moment to update the team on their work.

- [X] When a TM is asked to give project updates, they will want to know
what to say, so that they understand what is being asked of them.

- [X] When a TM is asked to give project updates, they will want to be able
to make small updates to their projects (such as status, description, or
ownership), so that they can make adjustment to their workload or update
their team with the latest information.

- [X] When all project updates are complete, the F will want to advance the
meeting to "Agenda Building", so that they keep things moving forward.

- [X] When the TMs enter the agenda building phase, they will want to be
able to add items to the agenda, so that they get a slot in the meeting to
ask for what they need.

- [X] When the TMs want to reprioritize their agenda, they will want to be
able to remove items, so they can spend their time on what they want.

- [X] When enough agenda items have been collected, the F will want to
advance the meeting to the "Process Agenda" phase, so that new actions and
projects can be created and TMs can request what they need of each other.

- [X] If a project update or agenda item should trigger a new agenda item
for a TM, they want to add it to the agenda, so that they have an opportunity
to get what they need.

- [X] When the meeting advances from agenda item to agenda item, the F will
want to know what to say ("what do you need?") and the TM will want to be
able to process the agenda item into new projects or actions.

- [X] When the TM has created a project or action by mistake, the TM will
want a control for deleting or canceling it, so that they don't add to the
noise of the team.

- [X] When all agenda items have been processed, the TMs will want one more
opportunity to add new items, so that they have one last chance to process
something before the meeting ends.

- [ ] When the meeting ends, TMs will want a summary of the meeting, so that
folks who weren't able to attend can see what happened.

## Team Dashboard

- [X] When a TM navigates to their team's dashboard, they will want a list
of all projects, so that they can see what their team has signed up to do
(and their place in it).

- [X] When a TM wants to update the team's dashboard, they will want easy
controls, so that they can add new projects, change the status of projects,
or reassign ownership.

- [X] When a TM doesn't feel comfortable creating a new project for another
person, they want to add an agenda item for the next meeting, so the request
can be made in a more public forum and weighed against other priorities.

- [X] When a meeting has begun for a TM and the TM visits the team dashboard,
they want to be notified that their other teammates are meeting, so that they
can join the meeting.

- [X] When a meeting is active, the TM shouldn't be able to edit the agenda
or team projects, so that they join their teammates in the meeting and
participate in the process.

- [ ] When a TM wants to invite a new team member, they'll want an obvious
control that allows them to input one or more email addresses, so that they
can join their pals.

- [ ] When a TL wants to create a new team, they'll want an obvious control
near their other teams to make a new team, so they can get their new group up
and going.

- [X] When a project is finished, a team member will want a control to archive
it, so that it can un-clutter the dashboard.

- [X] When a project is archived by mistake, a team member will want to
be able to find the project in the archive and restore it, so that they
can resume where they left off.

## Personal Dashboard

- [X] When a user receives an invitation to a new team, they will want to
be able to accept it, so that they can join their teammates.

- [X] When a TM navigates to their own personal dashboard, they will
want to see a list of their projects and actions, so that they can see what
they are responsible for.

- [X] When a TM creates a new project or action, they will want to be able
to assign it to a specific team, so that they can organize their work.

- [X] When a TM wants to update an item on their dashboard, they will want
controls that feel similar to the controls on the team dashboard, so that
they now how to keep an accurate account of work they are responsible for.
