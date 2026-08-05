import "./ArticleGithubStats.scss"
import React, {useEffect, useState} from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import AvatarView from "/src/components/generic/AvatarView.jsx"

/**
 * Fetches and displays live public GitHub stats (repos, followers, following, top languages)
 * for the username configured in the section's JSON settings ("github_username").
 *
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticleGithubStats({ dataWrapper, id }) {
    const username = "patelnikhil5245-blip"
    const [stats, setStats] = useState(null)
    const [languages, setLanguages] = useState([])
    const [status, setStatus] = useState("loading")

    useEffect(() => {
        let isMounted = true

        async function fetchGithubData() {
            try {
                const userRes = await fetch(`https://api.github.com/users/${username}`)
                if (!userRes.ok) throw new Error("user fetch failed")
                const userData = await userRes.json()

                const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
                const reposData = reposRes.ok ? await reposRes.json() : []

                const languageCounts = {}
                if (Array.isArray(reposData)) {
                    reposData.forEach(repo => {
                        if (repo.language) {
                            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
                        }
                    })
                }
                const topLanguages = Object.entries(languageCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([name, count]) => ({ name, count }))

                if (isMounted) {
                    setStats(userData)
                    setLanguages(topLanguages)
                    setStatus("ready")
                }
            } catch (e) {
                if (isMounted) setStatus("error")
            }
        }

        fetchGithubData()
        return () => { isMounted = false }
    }, [username])

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-github-stats`}
                 selectedItemCategoryId={null}
                 setSelectedItemCategoryId={() => {}}>

            {status === "loading" && (
                <div className={`article-github-stats-message`}>Loading GitHub activity…</div>
            )}

            {status === "error" && (
                <div className={`article-github-stats-message`}>
                    Couldn't load live GitHub stats right now. Visit the profile directly:{" "}
                    <a href={`https://github.com/${username}`} target={`_blank`} rel={`noreferrer`}>
                        github.com/{username}
                    </a>
                </div>
            )}

            {status === "ready" && stats && (
                <div className={`article-github-stats-content`}>
                    <div className={`article-github-stats-profile`}>
                        <AvatarView src={stats.avatar_url} className={`article-github-stats-avatar`}/>
                        <div>
                            <h5 className={`m-0`}>{stats.name || username}</h5>
                            <a href={stats.html_url} target={`_blank`} rel={`noreferrer`} className={`text-3`}>
                                @{username}
                            </a>
                        </div>
                    </div>

                    <div className={`article-github-stats-grid`}>
                        <div className={`article-github-stats-cell`}>
                            <span className={`article-github-stats-number`}>{stats.public_repos ?? "—"}</span>
                            <span className={`article-github-stats-label`}>Repositories</span>
                        </div>
                        <div className={`article-github-stats-cell`}>
                            <span className={`article-github-stats-number`}>{stats.followers ?? "—"}</span>
                            <span className={`article-github-stats-label`}>Followers</span>
                        </div>
                        <div className={`article-github-stats-cell`}>
                            <span className={`article-github-stats-number`}>{stats.following ?? "—"}</span>
                            <span className={`article-github-stats-label`}>Following</span>
                        </div>
                        <div className={`article-github-stats-cell`}>
                            <span className={`article-github-stats-number`}>{languages.length}</span>
                            <span className={`article-github-stats-label`}>Top Languages</span>
                        </div>
                    </div>

                    {languages.length > 0 && (
                        <div className={`article-github-stats-languages`}>
                            {languages.map((lang, key) => (
                                <span key={key} className={`article-github-stats-language-pill`}>
                                    {lang.name} · {lang.count}
                                </span>
                            ))}
                        </div>
                    )}

                    <a href={`https://github.com/${username}?tab=repositories`}
                       target={`_blank`}
                       rel={`noreferrer`}
                       className={`article-github-stats-cta`}>
                        View all repositories on GitHub →
                    </a>
                </div>
            )}
        </Article>
    )
}

export default ArticleGithubStats
