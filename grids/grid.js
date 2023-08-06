lock = 0
$('.grid-item').click(function () {
    if ($(this).attr('data-parent') == $(this).attr('id')) {
        return
    }
    var hasTarget = '#' + $(this).attr('data-parent')
    var divID = $(this).attr('id');
    if (lock == 0) {
        let storeTarget = hasTarget
        lock = 1
        let largePos = $(hasTarget)
        let smallPos = $(this)
        coords = {
            'rows': $(this).css('--rows'),
            'columns': $(this).css('--columns'),
            'x': $(this).css('--x-coord'),
            'y': $(this).css('--y-coord'),
            'borderRadius': $(this).css('border-radius')
        }
        $(this).css({
            '--rows': $(hasTarget).css('--rows'),
            '--columns': $(hasTarget).css('--columns'),
            '--x-coord': $(hasTarget).css('--x-coord'),
            '--y-coord': $(hasTarget).css('--y-coord'),
            'border-radius': $(hasTarget).css('border-radius')
        })
        $(hasTarget).css({
            '--rows': coords.rows,
            '--columns': coords.columns,
            '--x-coord': coords.x,
            '--y-coord': coords.y,
            'border-radius': coords.borderRadius
        })
        hasTarget = '#' + divID
        $('.grid-item-' + $(this).attr('data-id')).attr('data-parent', divID);
        smartCropping($(this), $(this).find('img'), { height: largePos.height(), width: largePos.width() });
        smartCropping($(storeTarget), $(storeTarget).find('img'), { height: smallPos.height(), width: smallPos.width() });
        
        setTimeout(() => {
            lock = 0;
            smartCropping($(this), $(this).find('img'), { height: smallPos.height(), width: smallPos.width() });
            smartCropping($(storeTarget), $(storeTarget).find('img'), { height: largePos.height(), width: largePos.width() });

        }, 1000)
    }
})
