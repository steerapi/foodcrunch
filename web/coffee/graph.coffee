# $ ->
#   console.log "done"
#   data = [ 
#     label: "Discounts"
#     data: [ [1, 1], [5, 5], [10, 10] ]
#   ]
#   plot = $.plot $("#placeholder"), data,
#     series:
#       bars:
#         horizontal: true
#         show: true
#     grid:
#       show: true
#       clickable: true
#   $("#placeholder").bind "plotclick", (event, pos, item) ->
#     if (item)
#       $("#clickdata").text("You clicked point " + item.dataIndex + " in " + item.series.label + ".")
#       plot.highlight(item.series, item.datapoint)

#Stacked

# $ ->
#   css_id = "#placeholder"
#   data = [
#     label: "foo"
#     data: [[1, 300], [2, 300], [3, 300], [4, 300], [5, 300]]
#   ,
#     label: "bar"
#     data: [[1, 800], [2, 600], [3, 400], [4, 200], [5, 0]]
#   ,
#     label: "baz"
#     data: [[1, 100], [2, 200], [3, 300], [4, 400], [5, 500]]
#   ]
#   options =
#     grid:
#       show: true
#       clickable: true
#     series:
#       stack: 0
#       bars:
#         # horizontal: true
#         show: true
#         barWidth: 0.9
#         align: "center"
#     xaxis:
#       ticks: [[1, "One"], [2, "Two"], [3, "Three"], [4, "Four"], [5, "Five"]]
# 
#   $(css_id).bind "plotclick", (event, pos, item) ->
#     console.log arguments
#     # if (item)
#     #   $("#clickdata").text("You clicked point " + item.dataIndex + " in " + item.series.label + ".")
#     #   plot.highlight(item.series, item.datapoint)
# 
#   $.plot $(css_id), data, options