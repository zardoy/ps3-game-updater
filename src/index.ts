import { parseString } from 'xml2js'
import { promisify } from 'util'
import got from 'got'

import { Debug } from '@prisma/debug'

const debug = Debug('client:game-updater')

const parseXml: (xml: string) => Promise<Record<string, any>> = promisify(parseString)

type UpdateVersionInfo = {
    version: string //'01.03'
    size: string //'14416384'
    sha1sum: string //'05e54ee009117a3912b82d3333465c582d860e81'
    url: string //'DOMAIN/tppkg/np/NPUA80864/NPUA80864_T3/31e203aae20a92a1/UP9000-NPUA80864_00-0000111122223333-A0103-V0100-PE.pkg'
    ps3_system_ver: string // '04.2000'
}

type GetUpdatesReturn = {
    versions: UpdateVersionInfo[]
    lastVersion?: string
    title?: string
}

/**
 * doesn't cache
 * @throws if game not found or updates not found
 */
export const getGameUpdates = async (gameId: string): Promise<GetUpdatesReturn | null> => {
    const { statusCode, body } = await got(`https://a0.ww.np.dl.${'play'}station.net/tpl/np/${gameId}/${gameId}-ver.xml`, {
        rejectUnauthorized: false,
    })

    debug(`get ${gameId}-ver.xml`, statusCode, body)

    if (!body.trim()) return null

    const data = await parseXml(body)

    const versionsRaw = data.titlepatch.tag[0].package
    const versions: UpdateVersionInfo[] = versionsRaw.map(version => version.$)
    return { title: versionsRaw.slice(-1)[0]?.paramsfo[0]?.TITLE[0], versions, lastVersion: versions.slice(-1)[0]?.version }
}
