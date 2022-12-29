import useSWR from 'swr'
import { multiJsonFetcher } from './helper/fetchers'
import { UITeams, UIUsers } from './helper/types'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import DeveloperPage from "./pages/DeveloperPage";
import LastUpdatePage from "./pages/LastUpdate";
import TeamsPage from "./pages/TeamsPage";
import { DepCount, ExtCount, getAllUserDependencies, getAllUserExtensions } from './components';

export type PageData = {
  users: UIUsers,
  teams: UITeams,
  userExt: ExtCount[],
  userDeps: DepCount[],
}

function App() {
  const { data, error } = useSWR({
    users: '/data/users.json',
    teams: '/data/teams.json',
  }, multiJsonFetcher)

  if (error) return <div>Failed to load: {error.toString()}</div>
  if (!data) return <div>Loading...</div>

  const users = data.users as UIUsers
  const teams = data.teams as UITeams
  const userExt = getAllUserExtensions(users)
  const userDeps = getAllUserDependencies(users)
  const pageData = { users, teams, userExt, userDeps } as PageData

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<DeveloperPage {...pageData} />} />
      <Route path="/teams" element={<TeamsPage {...pageData} />} />
      <Route path="lastupdate" element={<LastUpdatePage/>} />
    </Routes>
  </BrowserRouter>
  )
}

export default App;
