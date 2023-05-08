import { getGameUpdates } from './index.js'
import open from 'open'

if (process.argv.includes('--help')) {
    console.log('ps3-game-updater <game serial> [application in which url of package will be opened to download it (defaults to browser)]')
    process.exit(0)
}

if (!process.argv[2]) throw new Error('Provide game serial (like BCES01663) as argument')

getGameUpdates(process.argv[2]).then(result => {
    const app = process.argv[3]
    result?.versions.forEach(version => {
        // prettier-ignore
        open(version.url, app ? {
            app: {
                name: app,
            },
        } : undefined)
    })
})
