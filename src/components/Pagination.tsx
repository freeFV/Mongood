import React, { useEffect } from 'react'
import { Stack, IconButton, Text } from '@fluentui/react'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '@/stores'
import useSWR from 'swr'
import _ from 'lodash'

import { runCommand } from '@/utils/fetcher'
import { Number } from '@/utils/formatter'

export function Pagination() {
  const { database, collection } = useSelector((state) => state.root)
  const { index, filter, skip, limit, count } = useSelector(
    (state) => state.documents,
  )
  const dispatch = useDispatch()
  const { data } = useSWR(
    database && collection
      ? `count/${database}/${collection}/${JSON.stringify(filter)}`
      : null,
    () => {
      return runCommand<{ n: number }>(database, {
        count: collection,
        query: filter,
        hint: _.isEmpty(filter) ? undefined : index?.name,
      })
    },
    {
      refreshInterval: 60 * 1000,
      errorRetryCount: 0,
    },
  )
  useEffect(() => {
    dispatch(actions.documents.setCount(data?.n || 0))
  }, [data])
  useEffect(() => {
    dispatch(actions.documents.setSkip(0))
  }, [database, collection])

  return (
    <Stack horizontal={true} styles={{ root: { alignItems: 'center' } }}>
      {count ? (
        <Text style={{ marginRight: 20 }}>
          {skip + 1} ~ {Math.min(skip + limit, count)} of {Number.format(count)}
        </Text>
      ) : (
        <Text style={{ marginRight: 20 }}>total: {Number.format(count)}</Text>
      )}
      <IconButton
        iconProps={{ iconName: 'Back' }}
        disabled={skip <= 0}
        onClick={() => {
          dispatch(actions.documents.setSkip(Math.max(skip - limit, 0)))
        }}
      />
      <IconButton
        iconProps={{ iconName: 'Forward' }}
        disabled={skip + limit >= count}
        onClick={() => {
          dispatch(actions.documents.setSkip(Math.min(skip + limit, count)))
        }}
      />
    </Stack>
  )
}