import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";

const MainView = lazy(() => import("../views/app/main/Main"));
const BranchesView = lazy(() => import("../views/app/branches/Branches"));
const NewBranchView = lazy(() => import("../views/app/branches/new/NewBranch"));
const EditBranchView = lazy(() =>
  import("../views/app/branches/edit/EditBranch")
);
const MembersView = lazy(() => import("../views/app/members/Members"));
const EditMemberView = lazy(() =>
  import("../views/app/members/edit/EditMember")
);
const NewMemberView = lazy(() => import("../views/app/members/new/NewMember"));
const ProfileView = lazy(() => import("../views/app/profile/Profile"));
const SettingsView = lazy(() => import("../views/app/settings/Settings"));
const AccessGroupsView = lazy(() =>
  import("../views/app/access-groups/AccessGroups")
);
const NewAccessGroupView = lazy(() =>
  import("../views/app/access-groups/new/NewAccessGroup")
);
const EditAccessGroupView = lazy(() =>
  import("../views/app/access-groups/edit/EditAccessGroup")
);
const ActivityLogView = lazy(() =>
  import("../views/app/activity-log/ActivityLog")
);
const ApplicationsView = lazy(() =>
  import("../views/app/applications/Applications")
);
const NewApplicationView = lazy(() =>
  import("../views/app/applications/new/NewApplication")
);
const SingleApplicationView = lazy(() =>
  import("../views/app/applications/single/SingleApplication")
);

const ApplicantsView = lazy(() =>
  import("../views/app/applications/new/Applicants")
);

const ErrorView = lazy(() => import("../views/app/Error"));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/app" exact component={MainView} />
        <Route path="/app/branches" exact component={BranchesView} />
        <Route path="/app/branch/new" exact component={NewBranchView} />
        <Route
          path="/app/branch/:branchId/edit"
          exact
          component={EditBranchView}
        />
        <Route path="/app/members" exact component={MembersView} />
        <Route path="/app/member/new" exact component={NewMemberView} />
        <Route
          path="/app/member/:memberId/edit"
          exact
          component={EditMemberView}
        />
        <Route path="/app/profile" exact component={ProfileView} />
        <Route path="/app/settings" exact component={SettingsView} />
        <Route
          path="/app/settings/access-groups"
          exact
          component={AccessGroupsView}
        />
        <Route
          path="/app/settings/access-group/new"
          exact
          component={NewAccessGroupView}
        />
        <Route
          path="/app/settings/access-group/:accessGroupId/edit"
          exact
          component={EditAccessGroupView}
        />
        <Route
          path="/app/settings/activity-log"
          exact
          component={ActivityLogView}
        />
        <Route path="/app/applications" exact component={ApplicationsView} />
        <Route
          path="/app/application/new"
          exac
          component={NewApplicationView}
        />
        <Route
          path="/app/application/:appId"
          exact
          component={SingleApplicationView}
        />
        {/* <Route
          path="/app/application/:appId"
          exact
          render={({ match }) => (
            <SingleApplicationView key={match.params.appId || "empty"} />
          )}
        /> */}
        <Route path="/app/applicants" exact component={ApplicantsView} />
        <Route
          path="/app/applicants/:index/edit"
          exact
          component={NewApplicationView}
        />

        <Route component={ErrorView}></Route>
      </Switch>
    </Suspense>
  );
}
